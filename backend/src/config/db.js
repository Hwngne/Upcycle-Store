import mongoose from 'mongoose';

export const connectDB = async() =>{
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);

        console.log("Liên kết databse thành công");
    }catch(error){
        console.error("Lỗi kết nối database:", error);
        process.exit(1); //1 có nghĩa là thoát với trạng thái thất bại, còn 0 là thoát với trạng thái thành công
    }
}