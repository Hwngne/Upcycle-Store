import express from "express";

import {
    createArticle,
    getArticles,
    getArticleDetail,
    updateArticle,
    deleteArticle
} from "../../controllers/web//articleController.js";
import { authenticate } from "../../middlewares/auth.js";
import { uploadImage } from "../../middlewares/upload.js";
const router = express.Router();

router.post("/", authenticate, uploadImage.single("image"), createArticle);
router.get("/", authenticate, getArticles);
router.get("/:id", authenticate, getArticleDetail);
router.put("/:id", authenticate, uploadImage.single("image"), updateArticle);
router.delete("/:id", authenticate, deleteArticle);

export default router;