export const errorHandler = (err, req, res, next) => {
    console.error("Global error:", err);

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({
            message: `${field} đã tồn tại`,
        });
    }

    res.status(500).json({
        message: "Lỗi hệ thống",
    });
};
