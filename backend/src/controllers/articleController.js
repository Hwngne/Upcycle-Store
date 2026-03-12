import Article from "../models/Article.js";
import Quiz from "../models/Quiz.js";
import Activity from "../models/Activity.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";

/* =====================
   AUTO ACTIVITY MAP
===================== */
const ARTICLE_ACTIVITY_MAP = {
    hunt: "697ad3f517ed3ed00c825bec",
    home: "697aee900e1aa67b7161b519",
};
/* =====================
   CREATE ARTICLE
===================== */
export const createArticle = async (req, res) => {
    try {
        const {
            title,
            content,
            quizId,
            displayType,
            status = "draft",
            authorName,
        } = req.body;

        /* ===== BASIC VALIDATION ===== */
        if (!title || !content || !authorName || !displayType) {
            return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });
        }

        if (!["hunt", "home"].includes(displayType)) {
            return res.status(400).json({
                message: "displayType phải là 'hunt' hoặc 'home'",
            });
        }

        /* ===== QUIZ (CHỈ CHO HOME) ===== */
        let quiz = null;
        if (quizId) {
            if (displayType === "hunt") {
                return res.status(400).json({
                    message: "Bài hunt không được gắn quiz",
                });
            }

            if (!mongoose.Types.ObjectId.isValid(quizId)) {
                return res.status(400).json({ message: "quizId không hợp lệ" });
            }

            quiz = await Quiz.findById(quizId);
            if (!quiz) {
                return res.status(400).json({ message: "Quiz không tồn tại" });
            }
        }

        /* ===== AUTO ACTIVITY ===== */
        // const activityId = ARTICLE_ACTIVITY_MAP[displayType];
        // const activity = await Activity.findById(activityId);

        const activityId = ARTICLE_ACTIVITY_MAP[displayType];

        const activity = await Activity.findOne({
            _id: activityId,
            active: true,
        });

        if (!activity) {
            return res.status(500).json({
                message: "Activity mặc định cho bài báo không tồn tại",
            });
        }

        /* ===== THUMBNAIL ===== */
        let thumbnail = null;
        if (req.file) {
            const result = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
                { folder: "articles" }
            );
            thumbnail = result.secure_url;
        }

        /* ===== CREATE ARTICLE ===== */
        const article = await Article.create({
            title: title.trim(),
            authorName: authorName.trim(),
            content,
            displayType,
            quiz: quiz ? quiz._id : null,
            rewardActivity: activity._id,
            rewardPoint: activity.hunted_point,
            status,
            visible: status === "published",
            thumbnail,
            created_by: req.user._id,
        });

        const populated = await Article.findById(article._id)
            .populate("rewardActivity", "name hunted_point")
            .populate("quiz", "title hunted_point")
            .populate("created_by", "name");

        res.status(201).json({
            message: "Tạo bài báo thành công",
            data: populated,
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi server",
            error: error.message,
        });
    }
};

/* =====================
   GET ARTICLES
===================== */
export const getArticles = async (req, res) => {
    try {
        const articles = await Article.find()
            .populate("created_by", "name")
            .populate("quiz", "title hunted_point")
            .populate("rewardActivity", "name")
            .sort({ createdAt: -1 });

        res.json({ data: articles });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

/* =====================
   GET ARTICLE DETAIL
===================== */
export const getArticleDetail = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
            .populate("quiz", "title hunted_point")
            .populate("rewardActivity", "name hunted_point")
            .populate("created_by", "name email");

        if (!article) {
            return res.status(404).json({ message: "Không tìm thấy article" });
        }

        res.json(article);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

/* =====================
   UPDATE ARTICLE
===================== */
export const updateArticle = async (req, res) => {
    try {
        const {
            title,
            content,
            quizId,
            displayType,
            status,
            visible,
            authorName,
        } = req.body;

        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: "Không tìm thấy bài viết" });
        }

        /* ===== KHÓA NỘI DUNG SAU PUBLISHED ===== */
        if (article.status === "published") {
            const forbidden = ["title", "content", "displayType", "quizId"];
            for (const field of forbidden) {
                if (req.body[field] !== undefined) {
                    return res.status(400).json({
                        message: "Bài đã xuất bản không được chỉnh sửa nội dung",
                    });
                }
            }
        }

        if (authorName !== undefined) article.authorName = authorName.trim();
        if (title !== undefined) article.title = title.trim();
        if (content !== undefined) article.content = content;

        /* ===== QUIZ ===== */
        if (quizId !== undefined) {
            if (quizId === null) {
                article.quiz = null;
            } else {
                const quiz = await Quiz.findById(quizId);
                if (!quiz)
                    return res.status(400).json({ message: "Quiz không tồn tại" });
                article.quiz = quizId;
            }
        }

        /* ===== STATUS ===== */
        if (status !== undefined) {
            if (article.status === "published" && status === "draft") {
                return res.status(400).json({
                    message: "Không thể chuyển bài đã xuất bản về draft",
                });
            }
            article.status = status;
            article.visible = status === "published";
        }

        if (visible !== undefined) {
            if (article.status !== "published") {
                return res.status(400).json({
                    message: "Chỉ được bật hiển thị khi bài đã published",
                });
            }
            article.visible = visible;
        }

        await article.save();

        const populated = await Article.findById(article._id)
            .populate("quiz", "title hunted_point")
            .populate("rewardActivity", "name hunted_point")
            .populate("created_by", "name");

        res.json({
            message: "Cập nhật bài viết thành công",
            data: populated,
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi server",
            error: error.message,
        });
    }
};

/* =====================
   DELETE ARTICLE
===================== */
export const deleteArticle = async (req, res) => {
    try {
        await Article.findByIdAndDelete(req.params.id);
        res.json({ message: "Đã xóa bài viết" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
};