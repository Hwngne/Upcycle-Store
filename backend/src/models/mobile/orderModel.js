import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    // Liên kết với bài đăng sản phẩm
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    // Người mua
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Người bán
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Lưu lại tên sản phẩm tại thời điểm mua để phòng trường hợp bài đăng bị xóa
    productName: {
      type: String,
      required: true,
    },
    // Số lượng đặt mua
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    // Đơn giá sản phẩm
    price: { 
      type: Number,
      required: true,
      default: 0,
    },
    // Tổng số tiền thanh toán
    totalPrice: { 
      type: Number,
      required: true,
      default: 0,
    },
    // Trạng thái đơn hàng (pending: đang chờ xử lý, completed: đã hoàn thành, cancelled: đã hủy)
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'completed', 
    },
  },
  { timestamps: true } // Tự động tạo createdAt và updatedAt
);

// Khởi tạo và export model 'Order'
export default mongoose.model('Order', orderSchema);