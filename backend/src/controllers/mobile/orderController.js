import Order from '../../models/mobile/orderModel.js';
import Post from '../../models/mobile/postModel.js';

// ---  XÁC NHẬN CHỐT ĐƠN VÀ TRỪ SỐ LƯỢNG SẢN PHẨM ---
export const confirmOrder = async (req, res) => {
  try {
    const { postId, buyerId, quantity, totalPrice } = req.body;
    
    // Giả định middleware protect đã gán thông tin user vào req.user
    const sellerId = req.user._id; 

    // 1. Tìm bài đăng sản phẩm
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng sản phẩm." });
    }

    // Kiểm tra số lượng tồn kho có đủ không
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
    
    // (Tùy chọn) Tự động đổi trạng thái hiển thị nếu hết hàng
    if (post.quantity === 0) {
      post.status = "Hết hàng"; 
    }
    
    await post.save();

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

    // Tìm các đơn hàng mà user tham gia với vai trò là người mua HOẶC người bán
    const orders = await Order.find({
      $or: [{ buyer: userId }, { seller: userId }]
    })
    .populate('buyer', 'name email') // Lấy thêm thông tin để hiển thị tên đối tác bên App
    .populate('seller', 'name email')
    .sort({ createdAt: -1 }); // Sắp xếp mới nhất lên đầu

    // Map lại dữ liệu để khớp với định dạng mà Flutter đang chờ 
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