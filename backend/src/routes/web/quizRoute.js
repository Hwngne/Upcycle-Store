import express from "express";
import Quiz from "../../models/web/Quiz.js";
import {
    getAllQuizzes,
    createQuiz,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    submitQuiz,
    updateQuizStatus,
    toggleVisible,
    getQuizDetail,
    updateQuiz,
} from "../../controllers/web//quizController.js";
import { authenticate, authorize } from "../../middlewares/auth.js";
import { validateQuestion } from "../../middlewares/validateQuestion.js";

const router = express.Router();

/* ADMIN */
router.get("/", authenticate, authorize("admin"), getAllQuizzes);
router.post("/", authenticate, authorize("admin"), createQuiz);

router.post("/:quizId/question", authenticate, authorize("admin"), validateQuestion, addQuestion);
router.put("/:quizId/question/:index", authenticate, authorize("admin"), validateQuestion, updateQuestion);
router.delete("/:quizId/question/:index", authenticate, authorize("admin"), deleteQuestion);

router.patch("/:id/status", authenticate, authorize("admin"), updateQuizStatus);
router.patch("/:id/visible", authenticate, authorize("admin"), toggleVisible);

router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa quiz" });
});

router.get("/:id", authenticate, getQuizDetail);
router.put("/:id", authenticate, updateQuiz); 

/* STUDENT / CLUB */
router.post("/:quizId/submit", authenticate, authorize("student", "club"), submitQuiz);

export default router;
