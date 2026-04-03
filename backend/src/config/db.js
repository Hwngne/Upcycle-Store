import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    // Tự động tìm chuỗi kết nối 
    const uri = process.env.MONGODB_CONNECTIONSTRING || process.env.MONGO_URI;

    if (!uri) {
        console.error(" Lỗi: Không tìm thấy URL kết nối Database trong file .env!");
        process.exit(1);
    }

    // Kết nối Database
    const conn = await mongoose.connect(uri, {
      family: 4, // Ép dùng IPv4 để tránh lỗi timeout localhost
    });

    console.log(` Kết nối Database thành công! (Host: ${conn.connection.host})`);
  } catch (error) {
    console.error(` Lỗi kết nối database: ${error.message}`);
    process.exit(1); // 1 có nghĩa là thoát với trạng thái thất bại
  }
};