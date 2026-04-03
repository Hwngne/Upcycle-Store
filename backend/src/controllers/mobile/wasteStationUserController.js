import WasteStation from '../../models/web/WasteStation.js';

// 1. Lấy danh sách trạm rác 
export const getAllStations = async (req, res) => {
  try {
    const stations = await WasteStation.find().sort({ createdAt: -1 });
    console.log(` Đã trả về ${stations.length} trạm rác cho Client.`);
    res.status(200).json(stations);
  } catch (error) {
    console.error("Lỗi lấy danh sách trạm:", error);
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
};

// 2. Tạo trạm rác mới 
export const createStation = async (req, res) => {
    try {
        const newStation = await WasteStation.create(req.body);
        res.status(201).json({
            message: "Tạo trạm thành công!",
            data: newStation
        });
    } catch (error) {
        res.status(400).json({ message: "Tạo thất bại", error: error.message });
    }
};