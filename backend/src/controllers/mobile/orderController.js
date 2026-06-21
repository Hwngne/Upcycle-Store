import Order from '../../models/mobile/orderModel.js';
import Post from '../../models/mobile/postModel.js';
import Message from '../../models/mobile/messageModel.js';
import Notification from '../../models/mobile/notificationModel.js'; 

// ---  XÁC NHẬN CHỐT ĐƠN VÀ TRỪ SỐ LƯỢNG SẢN PHẨM ---
export const confirmOrder = async (req, res) => {
  try {
    const { postId, buyerId, quantity, totalPrice, messageId } = req.body;
    const sellerId = req.user._id; 

    // 1. Tìm bài đăng sản phẩm
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng sản phẩm." });
    }

    if (post.quantity < quantity) {
      return res.status(400).json({ message: "Số lượng sản phẩm không đủ để giao dịch." });
    }

    // 2. Tạo bản ghi Đơn hàng mới
    const newOrder = new Order({
      post: postId,
      buyer: buyerId,
      seller: sellerId,
      productName: post.title || post.category || 'Sản phẩm',
      quantity: quantity,
      price: post.price,
      totalPrice: totalPrice,
      status: 'completed'
    });

    await newOrder.save();

    // 3. Trừ đi số lượng sản phẩm trong kho (bảng Post)
    post.quantity = post.quantity - quantity;
    if (post.quantity === 0) {
      post.status = "Hết hàng"; 
    }
    await post.save();

    // 4. CẬP NHẬT LẠI TRẠNG THÁI TIN NHẮN 
    if (messageId) {
      const message = await Message.findById(messageId);
      if (message) {
        try {
          let contentObj = JSON.parse(message.content);
          contentObj.status = 'completed';
          message.content = JSON.stringify(contentObj);
          await message.save();
        } catch (parseError) {
          console.error("Lỗi parse nội dung tin nhắn:", parseError);
        }
      }
    }

    // ==========================================
    // 5. BẮN THÔNG BÁO CHO NGƯỜI MUA
    // ==========================================
    try {
      await Notification.create({
        user: buyerId, 
        title: "Đơn hàng đã được xác nhận!",
        message: `Người bán đã xác nhận đơn mua "${quantity}x ${newOrder.productName}" của bạn. Tổng thanh toán: ${totalPrice}đ.`,
        type: "chat", // Hiển thị icon liên quan đến giao dịch/tin nhắn
        isRead: false
      });
    } catch (notiErr) {
      console.error("Lỗi gửi thông báo xác nhận đơn:", notiErr);
    }
    // ==========================================

    res.status(201).json({ 
      message: "Xác nhận giao dịch thành công!", 
      order: newOrder 
    });

  } catch (error) {
    console.error("Lỗi confirmOrder:", error);
    res.status(500).json({ message: "Lỗi server khi xác nhận giao dịch." });
  }
};

// ---  LẤY LỊCH SỬ GIAO DỊCH C2C CỦA NGƯỜI DÙNG ---
export const getOrderHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({
      $or: [{ buyer: userId }, { seller: userId }]
    })
    .populate('buyer', 'name email')
    .populate('seller', 'name email')
    .sort({ createdAt: -1 }); 

    const formattedData = orders.map(order => {
      return {
        _id: order._id,
        postId: order.post,
        productName: order.productName,
        quantity: order.quantity,
        price: order.price,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt,
        buyerId: order.buyer ? order.buyer._id : null,
        buyerName: order.buyer ? order.buyer.name : "Người mua",
        sellerId: order.seller ? order.seller._id : null,
        sellerName: order.seller ? order.seller.name : "Người bán",
      };
    });

    res.status(200).json(formattedData);

  } catch (error) {
    console.error("Lỗi getOrderHistory:", error);
    res.status(500).json({ message: "Lỗi server khi lấy lịch sử giao dịch." });
  }
};

// --- TỪ CHỐI GIAO DỊCH ---
export const cancelOrder = async (req, res) => {
  try {
    const { messageId } = req.body;

    if (!messageId) {
      return res.status(400).json({ message: "Thiếu ID tin nhắn." });
    }

    const message = await Message.findById(messageId);
    if (message) {
      let contentObj = JSON.parse(message.content);
      contentObj.status = 'cancelled';
      
      message.content = JSON.stringify(contentObj);
      await message.save();

      // ==========================================
      // BẮN THÔNG BÁO CHO NGƯỜI MUA KHI BỊ TỪ CHỐI
      // ==========================================
      try {
        await Notification.create({
          user: message.sender, // Người mua (người gửi yêu cầu)
          title: "Đơn mua hàng bị từ chối",
          message: `Rất tiếc, người bán đã từ chối yêu cầu mua "${contentObj.title}" của bạn.`,
          type: "chat",
          isRead: false
        });
      } catch (notiErr) {
        console.error("Lỗi gửi thông báo từ chối:", notiErr);
      }
      // ==========================================

      return res.status(200).json({ message: "Đã từ chối giao dịch thành công." });
    } else {
      return res.status(404).json({ message: "Không tìm thấy tin nhắn." });
    }
  } catch (error) {
    console.error("Lỗi cancelOrder:", error);
    res.status(500).json({ message: "Lỗi server khi từ chối giao dịch." });
  }
};