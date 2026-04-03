// controllers/spinConfigController.js
import SpinConfig from "../../models/web/SpinConfig.js";

export const getSpinConfig = async (req, res) => {
    try {
        const configs = await SpinConfig
            .find({ isActive: true })
            .sort({ order: 1 });

        res.json(configs);
    } catch (err) {
        res.status(500).json({ message: "Lỗi lấy cấu hình vòng quay" });
    }
};
