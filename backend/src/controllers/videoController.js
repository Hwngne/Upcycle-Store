import Video from "../models/Video.js";
import cloudinary from "../config/cloudinary.js";
import Activity from "../models/Activity.js";
/* ======================
   GET ALL VIDEOS
====================== */
export const getAllVideos = async (req, res) => {
    try {
        const videos = await Video.find().sort({ createdAt: -1 });
        res.json(videos);
    } catch (err) {
        res.status(500).json({ message: "Không thể tải danh sách video" });
    }
};

/* ======================
   CREATE VIDEO
====================== */
export const createVideo = async (req, res) => {
    try {
        const { title, description, status = "draft" } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng upload video" });
        }

        /* Upload video lên Cloudinary */
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: "video",
                    folder: "videos",
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(req.file.buffer);
        });

        const activity = await Activity.findOne({
            name: "Xem video",
            active: true,
        });

        if (!activity) {
            return res.status(500).json({
                message: "Chưa cấu hình activity cho video",
            });
        }

        const video = await Video.create({
            title,
            description,
            videoUrl: uploadResult.secure_url,
            thumbnailUrl: cloudinary.url(uploadResult.public_id, {
                resource_type: "video",
                format: "jpg",
            }),
            publicId: uploadResult.public_id,

            rewardActivity: activity._id,
            rewardPoint: activity.hunted_point,

            status,
            visible: status === "published",
        });

        // const video = await Video.create({
        //     title,
        //     description,
        //     videoUrl: uploadResult.secure_url,
        //     thumbnailUrl: cloudinary.url(uploadResult.public_id, {
        //         resource_type: "video",
        //         format: "jpg",
        //     }),
        //     publicId: uploadResult.public_id,
        //     status,
        //     visible: status === "published",
        // });

        if (req.file === undefined && req.headers["content-type"]?.includes("multipart")) {
            return res.status(400).json({ message: "File video không hợp lệ" });
        }


        res.status(201).json(video);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: "Tạo video thất bại" });
    }
};

/* ======================
   UPDATE VIDEO
====================== */
// controllers/videoController.js
export const updateVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status } = req.body;

        const video = await Video.findById(id);
        if (!video) {
            return res.status(404).json({ message: "Không tìm thấy video" });
        }

        // Cập nhật các trường text nếu có
        if (title !== undefined) video.title = title.trim();
        if (description !== undefined) video.description = description.trim();

        // Xử lý status (nếu gửi lên)
        if (status) {
            if (!["draft", "published"].includes(status)) {
                return res.status(400).json({ message: "Status không hợp lệ" });
            }
            video.status = status;
            video.visible = status === "published" ? video.visible : false;
        }

        // Nếu có file video mới → thay thế
        if (req.file) {
            // Xóa file cũ trên Cloudinary nếu tồn tại
            if (video.publicId) {
                try {
                    await cloudinary.uploader.destroy(video.publicId, {
                        resource_type: "video",
                    });
                } catch (destroyErr) {
                    console.warn("Không xóa được video cũ:", destroyErr.message);
                    // vẫn tiếp tục, không throw error
                }
            }

            // Upload file mới
            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        resource_type: "video",
                        folder: "videos",
                        // có thể thêm: eager: [{ format: "jpg", width: 640, crop: "limit" }]
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(req.file.buffer);
            });

            // Cập nhật các trường liên quan đến file
            video.videoUrl = uploadResult.secure_url;
            video.publicId = uploadResult.public_id;
            video.thumbnailUrl = cloudinary.url(uploadResult.public_id, {
                resource_type: "video",
                format: "jpg",
                // width: 640, height: 360, crop: "fill" → tùy chọn
            });
        }

        await video.save();

        console.log("Update request:", {
            hasFile: !!req.file,
            body: req.body,
            file: req.file ? req.file.originalname : null,
        });

        // Trả về video đã cập nhật
        res.json(video);
    } catch (err) {
        console.error("Update video error:", err);
        res.status(500).json({
            message: "Cập nhật video thất bại",
            error: err.message,
        });
    }
};


/* ======================
   UPDATE STATUS
====================== */
export const updateVideoStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["published", "draft"].includes(status)) {
            return res.status(400).json({ message: "Status không hợp lệ" });
        }

        const video = await Video.findById(id);
        if (!video) {
            return res.status(404).json({ message: "Không tìm thấy video" });
        }

        video.status = status;
        if (status === "draft") video.visible = false;

        await video.save();
        res.json(video);
    } catch (err) {
        res.status(500).json({ message: "Cập nhật trạng thái thất bại" });
    }
};

/* ======================
   TOGGLE VISIBLE
====================== */
export const toggleVideoVisible = async (req, res) => {
    try {
        const { id } = req.params;

        const video = await Video.findById(id);
        if (!video) {
            return res.status(404).json({ message: "Không tìm thấy video" });
        }

        if (video.status === "draft") {
            return res
                .status(400)
                .json({ message: "Không thể hiển thị video bản nháp" });
        }

        video.visible = !video.visible;
        await video.save();

        res.json(video);
    } catch (err) {
        res.status(500).json({ message: "Cập nhật hiển thị thất bại" });
    }
};

/* ======================
   DELETE VIDEO
====================== */
export const deleteVideo = async (req, res) => {
    try {
        const { id } = req.params;
        await Video.findByIdAndDelete(id);
        res.json({ message: "Xóa video thành công" });
    } catch (err) {
        res.status(500).json({ message: "Xóa video thất bại" });
    }
};
