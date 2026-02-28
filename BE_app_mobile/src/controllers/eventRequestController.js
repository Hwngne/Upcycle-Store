const EventRequest = require('../models/eventRequestModel');
const User = require('../models/userModel');
const Post = require('../models/postModel'); 

const POINTS_REWARD_CREATE = 100; 
const POINTS_COST_PER_DAY = 100; 

// --- HÀM PHỤ TRỢ: Tính số ngày ---
const calculateDaysDifference = (startStr, endStr) => {
  if (!startStr || !endStr) return 0;
  try {
    const [d1, m1, y1] = startStr.split('/');
    const [d2, m2, y2] = endStr.split('/');
    const date1 = new Date(y1, m1 - 1, d1);
    const date2 = new Date(y2, m2 - 1, d2);
    const diffTime = date2 - date1;
    if (diffTime < 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (e) { return 0; }
};

// --- HÀM PHỤ TRỢ: Parse ngày từ dd/MM/yyyy sang Date object ---
const parseDateStr = (dateStr) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/');
    return new Date(year, month - 1, day); 
};

// --- HÀM PHỤ TRỢ: Lấy danh sách các ngày giữa 2 mốc ---
const getDatesInRange = (startDate, endDate) => {
    const date = new Date(startDate.getTime());
    const dates = [];
    while (date <= endDate) {
        dates.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return dates;
};

// 1. TẠO YÊU CẦU SỰ KIỆN
const createEventRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    let {
      name, topic, description, isPaid, price,
      location, date, startTime, endTime,
      contactName, contactEmail, contactPhone, formLink,
      promotionLocations, promotionStartDate, promotionEndDate
    } = req.body;

    if (typeof promotionLocations === 'string') {
        try {
            promotionLocations = JSON.parse(promotionLocations);
        } catch (e) {
            promotionLocations = []; 
        }
    }

    let bannerUrl = "";
    let attachmentUrl = "";

    if (req.files) {
        if (req.files['banner'] && req.files['banner'][0]) {
            bannerUrl = req.files['banner'][0].path; 
        }
        if (req.files['attachment'] && req.files['attachment'][0]) {
            attachmentUrl = req.files['attachment'][0].path;
        }
    }

    // --- TÍNH TOÁN ĐIỂM ---
    let pointsChange = POINTS_REWARD_CREATE;
    if (promotionLocations && promotionLocations.length > 0) {
      const duration = calculateDaysDifference(promotionStartDate, promotionEndDate);
      if (duration > 3) {
        const extraDays = duration - 3; 
        const extensionCost = extraDays * POINTS_COST_PER_DAY; 
        pointsChange -= extensionCost;
      }
    }

    // --- CẬP NHẬT USER ---
    const user = await User.findById(userId);
    const currentPoints = user.total_points || 0;
    const newTotalPoints = currentPoints + pointsChange;

    if (newTotalPoints < 0) {
      return res.status(400).json({
        message: `Bạn không đủ điểm. Hiện có: ${currentPoints}, Cần phí: ${Math.abs(pointsChange - POINTS_REWARD_CREATE)}.`
      });
    }

    user.total_points = newTotalPoints;
    await user.save();
    
    // --- TẠO DB ---
    const hasPromotion = promotionLocations && promotionLocations.length > 0;
    const newRequest = await EventRequest.create({
      createdBy: userId,
      name, topic, description,
      isPaid, price: price ? price.toString() : "Miễn phí",
      location, date, startTime, endTime,
      contactName, contactEmail, contactPhone, formLink,
      bannerUrl, attachmentUrl,
      promotionLocations: promotionLocations || [],
      promotionStartDate: promotionStartDate || "",
      promotionEndDate: promotionEndDate || "",
      promotionStatus: hasPromotion ? 'pending' : 'none',
      status: 'pending'
    });

    res.status(201).json({ success: true, message: `Gửi yêu cầu thành công!`, data: newRequest });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};

// 2. LẤY DANH SÁCH YÊU CẦU
const getAllRequests = async (req, res) => {
    try {
        const requests = await EventRequest.find()
            .populate('createdBy', 'student_name club_info email') 
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getMyEvents = async (req, res) => {
    try {
        const myEvents = await EventRequest.find({ createdBy: req.user.id })
            .sort({ createdAt: -1 }); 
        res.json(myEvents);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server: " + error.message });
    }
}

// 3. CHECK LỊCH & LẤY BANNER 
const getPromotionAvailability = async (req, res) => {
    try {
        const { month, year } = req.query; 
        if (!month || !year) return res.status(400).json({ message: "Thiếu tháng/năm" });

        const activeRequests = await EventRequest.find({
            promotionStatus: { $in: ['pending', 'approved', 'active'] },
            promotionStartDate: { $ne: "" },
            promotionEndDate: { $ne: "" }
        }).select('promotionStartDate promotionEndDate');

        let slotCounts = {};
        activeRequests.forEach(req => {
            const start = parseDateStr(req.promotionStartDate);
            const end = parseDateStr(req.promotionEndDate);
            if (start && end) {
                const range = getDatesInRange(start, end);
                range.forEach(date => {
                    if (date.getMonth() + 1 == month && date.getFullYear() == year) {
                        const dateKey = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                        slotCounts[dateKey] = (slotCounts[dateKey] || 0) + 1;
                    }
                });
            }
        });
        res.json({ success: true, data: slotCounts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getActiveBanners = async (req, res) => {
    try {
        const events = await EventRequest.find({
            promotionStatus: { $in: ['active', 'approved'] },
            bannerUrl: { $ne: "" } 
        }).select('bannerUrl promotionStartDate promotionEndDate name formLink');

        const activeBanners = events.filter(event => {
            if (!event.promotionStartDate || !event.promotionEndDate) return false;
            const start = parseDateStr(event.promotionStartDate);
            const end = parseDateStr(event.promotionEndDate);
            if(!start || !end) return false;
            
            end.setHours(23, 59, 59);
            const now = new Date();
            return now >= start && now <= end;
        });

        res.json(activeBanners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. DUYỆT SỰ KIỆN (ADMIN) -> COPY SANG FORUM
const approveEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        const eventRequest = await EventRequest.findById(id);
        if (!eventRequest) return res.status(404).json({ message: "Sự kiện không tồn tại" });

        eventRequest.status = status;
        
        // Logic Banner
        if (status === 'approved' && eventRequest.promotionStatus === 'pending') {
             eventRequest.promotionStatus = 'active'; 
        } else if (status === 'rejected') {
             eventRequest.promotionStatus = 'rejected';
        }

        await eventRequest.save();

        // COPY SANG FORUM
        if (status === 'approved') {
            const existingPost = await Post.findOne({ title: eventRequest.name }); 
            if (!existingPost) {
                // Xử lý giá tiền an toàn
                let finalPrice = 0;
                if (eventRequest.isPaid && eventRequest.price) {
                    const priceStr = eventRequest.price.toString().replace(/[^0-9]/g, '');
                    finalPrice = parseFloat(priceStr) || 0;
                }

                const newPost = new Post({
                    author: eventRequest.createdBy, 
                    type: "Sự kiện", 
                    title: eventRequest.name,
                    content: eventRequest.description,
                    image: eventRequest.bannerUrl,
                    attachment: eventRequest.attachmentUrl,
                    attachmentName: "Tài liệu đính kèm",
                    topic: eventRequest.topic,
                    price: finalPrice,
                    category: "Sự kiện", 
                    phone: eventRequest.contactPhone,
                    date: eventRequest.date,
                    eventTime: `${eventRequest.startTime} - ${eventRequest.endTime}`,
                    eventLocation: eventRequest.location,
                    status: "Đang hiển thị"
                });

                await newPost.save();
            }
        }

        res.json({ success: true, message: `Đã cập nhật trạng thái thành ${status}` });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    createEventRequest, 
    getAllRequests, 
    getMyEvents, 
    getPromotionAvailability, 
    getActiveBanners, 
    approveEvent 
};