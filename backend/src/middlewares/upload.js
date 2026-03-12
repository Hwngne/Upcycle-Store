// import multer from "multer";

// const storage = multer.memoryStorage();

// const fileFilter = (req, file, cb) => {
//     if (!file.mimetype.startsWith("image/")) {
//         cb(new Error("Chỉ cho phép upload ảnh"), false);
//     }
//     cb(null, true);
// };

// export const uploadImage = multer({
//     storage,
//     fileFilter,
//     limits: {
//         fileSize: 5 * 1024 * 1024, // 5MB
//     },
// });
import multer from "multer";

const storage = multer.memoryStorage();

/* ================= IMAGE UPLOAD ================= */
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Chỉ cho phép upload ảnh"), false);
    }
};

export const uploadImage = multer({
    storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

/* ================= VIDEO UPLOAD ================= */
const videoFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
        cb(null, true);
    } else {
        cb(null, false); // ⬅️ KHÔNG throw error
    }
};


export const uploadVideo = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("video/")) {
            cb(new Error("Chỉ cho phép upload video"));
        } else {
            cb(null, true);
        }
    },
});