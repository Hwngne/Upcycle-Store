import jwt from 'jsonwebtoken';
import User from '../models/mobile/userModel.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Tìm user tương ứng
      const currentUser = await User.findById(decoded.id).select('-password');
      
      // BẢO VỆ LỚP 2: Kiểm tra xem user này còn tồn tại trong DB không
      if (!currentUser) {
        return res.status(401).json({ message: 'Tài khoản không còn tồn tại trên hệ thống!' });
      }

      // Gán vào req.user và cho đi tiếp
      req.user = currentUser;
      next();

    } catch (error) {
      console.error("Lỗi xác thực Token:", error.message);
      return res.status(401).json({ message: 'Không có quyền truy cập, token sai hoặc đã hết hạn!' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Không có token, vui lòng đăng nhập!' });
  }
};