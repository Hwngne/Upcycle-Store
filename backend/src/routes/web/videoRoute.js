import express from "express";
import {
    getAllVideos,
    createVideo,
    updateVideo,
    updateVideoStatus,
    toggleVideoVisible,
    deleteVideo,
} from "../../controllers/web//videoController.js";
import { uploadVideo } from "../../middlewares/upload.js";

const router = express.Router();

router.get("/", getAllVideos);
router.post("/", uploadVideo.single("video"), createVideo);
router.put("/:id", uploadVideo.single("video"), updateVideo);
router.patch("/:id/status", updateVideoStatus);
router.patch("/:id/visible", toggleVideoVisible);
router.delete("/:id", deleteVideo);

export default router;
