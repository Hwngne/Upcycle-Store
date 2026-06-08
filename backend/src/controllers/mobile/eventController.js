import ClubEvent from '../../models/mobile/eventModel.js';

export const createEvent = async (req, res) => {
  try {
    const clubId = req.user._id;
    const body = req.body;

    // 1. Xử lý đường dẫn file 
    let finalBannerUrl = body.bannerUrl || "";
    let finalAttachmentUrl = body.attachmentUrl || "";

    if (req.files) {
      if (req.files['banner'] && req.files['banner'].length > 0) {
        finalBannerUrl = req.files['banner'][0].path.replace(/\\/g, "/"); 
      }
      if (req.files['attachment'] && req.files['attachment'].length > 0) {
        finalAttachmentUrl = req.files['attachment'][0].path.replace(/\\/g, "/");
      }
    }

    // 2. Xử lý mảng Quảng bá 
    let promoLocs = [];
    if (body.promotionLocations) {
      try {
        promoLocs = JSON.parse(body.promotionLocations);
      } catch (e) {
        promoLocs = body.promotionLocations; // Đề phòng lỗi parse
      }
    }

    // 3. Đúc dữ liệu vào Model
    const newEvent = new ClubEvent({
      title: body.title,
      topic: body.topic,
      description: body.description,
      isPaid: body.isPaid === 'true', // Chuyển chuỗi "true" thành boolean thực sự
      price: body.price,
      location: body.location,
      eventDate: body.eventDate,
      registrationDeadline: body.registrationDeadline,
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      bannerUrl: finalBannerUrl,
      attachmentUrl: finalAttachmentUrl,
      promotionLocations: promoLocs,
      promotionStartDate: body.promotionStartDate,
      promotionEndDate: body.promotionEndDate,
      club: clubId,
      status: 'pending' // Chờ admin duyệt
    });

    await newEvent.save();

    res.status(201).json({
      message: "Tạo sự kiện thành công!",
      event: newEvent
    });

  } catch (error) {
    console.error("Lỗi khi tạo sự kiện:", error);
    res.status(500).json({ message: "Lỗi server khi tạo sự kiện." });
  }
};