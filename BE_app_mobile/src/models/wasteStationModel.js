const mongoose = require('mongoose');

const wasteStationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Vui lòng nhập tên trạm"],
  },
  address: {
    type: String,
    required: [true, "Vui lòng nhập địa chỉ"],
  },
  latitude: { // Vĩ độ (để hiển thị map sau này)
    type: Number,
    required: true, 
    default: 10.7769 // Mặc định ở HCM
  },
  longitude: { // Kinh độ
    type: Number,
    required: true,
    default: 106.7009
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
}, { timestamps: true });

module.exports = mongoose.model('WasteStation', wasteStationSchema);