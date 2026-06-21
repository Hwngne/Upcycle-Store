import EventRequest from '../../models/web/EventRequest.js';
import User from '../../models/mobile/userModel.js';
import Post from '../../models/mobile/postModel.js'; 
import jsQR from 'jsqr';
import * as Jimp from 'jimp';

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
export const createEventRequest = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id; 
    let {
      title, 
      topic, description, isPaid, price,
      location, eventDate, registrationDeadline, 
      contactName, contactEmail, contactPhone, 
      promotionLocations, promotionStartDate, promotionEndDate
    } = req.body;

    // Chuyển isPaid từ chuỗi sang boolean nếu cần
    const isPaidBool = isPaid === 'true' || isPaid === true;

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
            bannerUrl = req.files['banner'][0].path.replace(/\\/g, "/"); 
        }
        if (req.files['attachment'] && req.files['attachment'][0]) {
            attachmentUrl = req.files['attachment'][0].path.replace(/\\/g, "/");
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
    
    // Xử lý tách eventDate (ISO String) ra ngày/giờ cho Admin Web không bị lỗi
    let dateStr = "";
    let startTimeStr = "";
    let endTimeStr = "";
    if (eventDate) {
      const d = new Date(eventDate);
      dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
      startTimeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      endTimeStr = "23:59"; 
    }

    const hasPromotion = promotionLocations && promotionLocations.length > 0;
    
    // --- TẠO DB ---
    const newRequest = await EventRequest.create({
      createdBy: userId,
      name: title || req.body.name, // Giữ lại name cho Admin Web đọc
      topic, description,
      isPaid: isPaidBool, 
      price: price ? price.toString() : "Miễn phí",
      location, 
      date: dateStr || req.body.date, 
      startTime: startTimeStr || req.body.startTime, 
      endTime: endTimeStr || req.body.endTime,
      eventDate: eventDate, 
      registrationDeadline: registrationDeadline, // LƯU HẠN CHÓT MỚI
      participants: [], 
      contactName, contactEmail, contactPhone, 
      formLink: "", // Không dùng nữa nhưng giữ rỗng để không lỗi Web
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

// --- THÊM HÀM ĐĂNG KÝ  ---
export const registerEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const studentId = req.user.id || req.user._id;

    const event = await EventRequest.findById(eventId);
    if (!event) return res.status(404).json({ message: "Sự kiện không tồn tại." });

    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ message: "Sự kiện đã đóng đăng ký." });
    }

    const isAlreadyRegistered = event.participants.some(
      (p) => p.studentId.toString() === studentId.toString()
    );

    if (isAlreadyRegistered) {
      return res.status(400).json({ message: "Bạn đã đăng ký sự kiện này rồi." });
    }

    event.participants.push({ studentId, registeredAt: new Date(), checkInStatus: 'registered' });
    await event.save();

    res.status(200).json({ success: true, message: "Đăng ký thành công!" });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ message: "Lỗi server." });
  }
};

// --- LẤY DANH SÁCH SINH VIÊN ĐÃ ĐĂNG KÝ (Có populate thông tin User) ---
export const getEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Tìm event và populate mảng participants.studentId
    const event = await EventRequest.findById(eventId)
      .populate({
        path: 'participants.studentId',
        select: 'student_name student_id email avatar', // Chỉ lấy những trường cần thiết để nhẹ payload
      });

    if (!event) {
      return res.status(404).json({ message: "Sự kiện không tồn tại." });
    }

    // Định dạng lại data trả về cho frontend dễ xử lý
    const formattedParticipants = event.participants.map(p => {
        // Kiểm tra xem studentId có tồn tại không (đề phòng user đã bị xóa khỏi DB)
        const studentInfo = p.studentId || {}; 
        
        return {
            _id: studentInfo._id,
            studentName: studentInfo.student_name || "Sinh viên ẩn danh",
            studentCode: studentInfo.student_id || "N/A",
            email: studentInfo.email || "",
            avatar: studentInfo.avatar || "",
            registeredAt: p.registeredAt,
            checkInStatus: p.checkInStatus,
            checkInAt: p.checkInAt
        };
    });

    res.status(200).json({ 
        success: true, 
        data: formattedParticipants 
    });

  } catch (error) {
    console.error("Lỗi lấy danh sách sinh viên:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách." });
  }
};

// 2. LẤY DANH SÁCH YÊU CẦU
export const getAllRequests = async (req, res) => {
    try {
        const requests = await EventRequest.find()
            .populate('createdBy', 'student_name club_info email') 
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyEvents = async (req, res) => {
    try {
        const myEvents = await EventRequest.find({ createdBy: req.user.id })
            .sort({ createdAt: -1 }); 
        res.json(myEvents);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server: " + error.message });
    }
};

// 3. CHECK LỊCH & LẤY BANNER 
export const getPromotionAvailability = async (req, res) => {
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

export const getActiveBanners = async (req, res) => {
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

// --- LẤY DANH SÁCH SỰ KIỆN SINH VIÊN ĐÃ ĐĂNG KÝ (VÉ ĐIỆN TỬ) ---
export const getMyRegisteredEvents = async (req, res) => {
  try {
    const studentId = req.user.id || req.user._id;

    // Tìm các sự kiện có chứa studentId trong mảng participants
    const events = await EventRequest.find({
      'participants.studentId': studentId
    }).sort({ createdAt: -1 }); // Sự kiện mới đăng ký lên đầu

    // Map lại data cho đúng chuẩn Frontend cần
    const tickets = events.map(event => {
      // Tìm trạng thái điểm danh của sinh viên này
      const myParticipantInfo = event.participants.find(
        p => p.studentId.toString() === studentId.toString()
      );

      // Xác định trạng thái hiển thị trên vé
      let ticketStatus = "Sắp diễn ra";
      if (myParticipantInfo && myParticipantInfo.checkInStatus === 'attended') {
        ticketStatus = "Đã tham gia";
      }

      return {
        eventId: event._id,
        eventName: event.name || "Sự kiện chưa có tên",
        date: event.date || "Chưa cập nhật",
        time: `${event.startTime || '00:00'} - ${event.endTime || '23:59'}`,
        location: event.location || "Chưa cập nhật",
        status: ticketStatus
      };
    });

    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    console.error("Lỗi lấy danh sách vé:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách vé." });
  }
};

// --- XỬ LÝ QUÉT MÃ QR ĐIỂM DANH TỪ ẢNH CHỤP ---
export const checkInWithQRImage = async (req, res) => {
  try {
    // 1. Kiểm tra xem có file ảnh gửi lên không
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Không tìm thấy ảnh mã QR." });
    }

    // 2. Dùng Jimp đọc ảnh từ bộ nhớ đệm (buffer)
    const image = await Jimp.read(req.file.buffer);
    const imageData = {
      data: new Uint8ClampedArray(image.bitmap.data),
      width: image.bitmap.width,
      height: image.bitmap.height
    };

    // 3. Giải mã QR bằng jsQR
    const decodedQR = jsQR(imageData.data, imageData.width, imageData.height);

    if (!decodedQR) {
      return res.status(400).json({ success: false, message: "Ảnh mờ hoặc không nhận diện được mã QR. Vui lòng chụp lại!" });
    }

    // 4. Bóc tách dữ liệu từ QR (Định dạng: eventId|studentId)
    const qrText = decodedQR.data; 
    const parts = qrText.split('|');

    if (parts.length !== 2) {
      return res.status(400).json({ success: false, message: "Mã QR không hợp lệ hoặc không phải của hệ thống này." });
    }

    const [eventId, studentId] = parts;

    // 5. Tìm sự kiện và kiểm tra danh sách
    const event = await EventRequest.findById(eventId).populate('participants.studentId', 'student_name');
    
    if (!event) {
      return res.status(404).json({ success: false, message: "Sự kiện không tồn tại hoặc đã bị xóa." });
    }

    // Tìm sinh viên trong mảng đăng ký
    const participantIndex = event.participants.findIndex(
      p => p.studentId && p.studentId._id.toString() === studentId
    );

    if (participantIndex === -1) {
      return res.status(400).json({ success: false, message: "Sinh viên này chưa đăng ký tham gia sự kiện!" });
    }

    const participant = event.participants[participantIndex];

    // Kiểm tra xem đã điểm danh trước đó chưa
    if (participant.checkInStatus === 'attended') {
      return res.status(400).json({ 
        success: false, 
        message: `Sinh viên ${participant.studentId.student_name} đã được điểm danh trước đó rồi!` 
      });
    }

    // 6. Cập nhật trạng thái thành 'attended'
    event.participants[participantIndex].checkInStatus = 'attended';
    event.participants[participantIndex].checkInAt = new Date();
    await event.save();

    // 7. Trả về thành công
    return res.status(200).json({
      success: true,
      message: `Điểm danh thành công!\nSinh viên: ${participant.studentId.student_name}`
    });

  } catch (error) {
    console.error("Lỗi quét QR:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi xử lý mã QR." });
  }
};
  // --- XỬ LÝ QUÉT MÃ QR ĐIỂM DANH TỪ TEXT JSON (LUỒNG SIÊU TỐC MỚI) ---
export const checkInWithQRText = async (req, res) => {
  try {
    // 1. Lấy chuỗi text được gửi từ Mobile lên
    const { qrText } = req.body;

    if (!qrText) {
      return res.status(400).json({ success: false, message: "Không tìm thấy dữ liệu mã QR." });
    }

    // 2. Bóc tách dữ liệu từ QR (Định dạng mong đợi: eventId|studentId)
    const parts = qrText.split('|');

    if (parts.length !== 2) {
      return res.status(400).json({ success: false, message: "Mã QR không hợp lệ hoặc không phải của hệ thống này." });
    }

    const [eventId, studentId] = parts;

    // 3. Tìm sự kiện và kiểm tra danh sách
    const event = await EventRequest.findById(eventId).populate('participants.studentId', 'student_name');
    
    if (!event) {
      return res.status(404).json({ success: false, message: "Sự kiện không tồn tại hoặc đã bị xóa." });
    }

    // 4. Tìm sinh viên trong mảng đăng ký
    const participantIndex = event.participants.findIndex(
      p => p.studentId && p.studentId._id.toString() === studentId
    );

    if (participantIndex === -1) {
      return res.status(400).json({ success: false, message: "Sinh viên này chưa đăng ký tham gia sự kiện!" });
    }

    const participant = event.participants[participantIndex];

    // 5. Kiểm tra xem đã điểm danh trước đó chưa
    if (participant.checkInStatus === 'attended') {
      return res.status(400).json({ 
        success: false, 
        message: `Sinh viên ${participant.studentId.student_name} đã được điểm danh trước đó rồi!` 
      });
    }

    // 6. Cập nhật trạng thái thành 'attended'
    event.participants[participantIndex].checkInStatus = 'attended';
    event.participants[participantIndex].checkInAt = new Date();
    await event.save();

    // 7. Trả về thành công
    return res.status(200).json({
      success: true,
      message: `Điểm danh thành công!\nSinh viên: ${participant.studentId.student_name}`
    });

  } catch (error) {
    console.error("Lỗi quét QR Text:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi xử lý mã QR." });
  }
};
