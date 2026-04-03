import Quiz from "../../models/web/Quiz.js";
import QuizAttempt from "../../models/web/QuizAttempt.js";
import Account from "../../models/web/Account.js";
import Activity from "../../models/web/Activity.js";
import mongoose from "mongoose";

/* =========================
   GET ALL QUIZZES (ADMIN)
========================= */
export const getAllQuizzes = async (req, res) => {
    const { search, status, visible, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (search) filter.title = { $regex: search, $options: "i" };
    if (status) filter.status = status;
    if (visible !== undefined) filter.visible = visible === "true";

    const quizzes = await Quiz.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const total = await Quiz.countDocuments(filter);

    res.json({
        data: quizzes.map(q => ({
            id: q._id,
            _id: q._id,
            title: q.title,
            questions: q.questions.length,
            timeLimit: `${q.time_limit} phút`,
            points: q.rewardPoint,
            status: q.status,
            // status: q.status === "published" ? "Đã xuất bản" : "Bản nháp",
            visible: q.visible,
            createdAt: q.createdAt,
        })),
        total,
    });
};


export const createQuiz = async (req, res) => {
    try {
        const { title, time_limit, status, questions = [] } = req.body;

        if (!title || !time_limit) {
            return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });
        }

        // const quiz = await Quiz.create({
        //     title: title.trim(),
        //     time_limit: Number(time_limit),
        //     status,
        //     visible: status === "published",
        //     questions,
        //     created_by: req.user._id,
        // });

        const activity = await Activity.findById("695f8e029b19303f00bc5ce7");

        if (!activity) {
            return res.status(500).json({ message: "Không tìm thấy activity Làm Quiz" });
        }

        const quiz = await Quiz.create({
            title: title.trim(),
            time_limit: Number(time_limit),
            status,
            visible: status === "published",
            questions,
            created_by: req.user._id,

            rewardActivity: activity._id,
            rewardPoint: activity.hunted_point,
        });

        res.status(201).json({
            message: "Tạo quiz thành công",
            data: quiz,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi tạo quiz" });
    }
};


export const addQuestion = async (req, res) => {
    const { quizId } = req.params;
    const question = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz không tồn tại" });

    if (quiz.questions.length >= 5) {
        return res.status(400).json({ message: "Quiz tối đa 5 câu hỏi" });
    }

    quiz.questions.push(question);
    await quiz.save();

    res.json({ message: "Thêm câu hỏi thành công", data: quiz });
};

/* =========================
   UPDATE QUESTION (ADMIN)
========================= */
export const updateQuestion = async (req, res) => {
    const { quizId, index } = req.params;
    const question = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz || !quiz.questions[index]) {
        return res.status(404).json({ message: "Câu hỏi không tồn tại" });
    }

    quiz.questions[index] = question;
    await quiz.save();

    res.json({ message: "Cập nhật câu hỏi thành công", data: quiz });
};

/* =========================
   DELETE QUESTION (ADMIN)
========================= */
export const deleteQuestion = async (req, res) => {
    const { quizId, index } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz || !quiz.questions[index]) {
        return res.status(404).json({ message: "Câu hỏi không tồn tại" });
    }

    quiz.questions.splice(index, 1);
    await quiz.save();

    res.json({ message: "Xóa câu hỏi thành công" });
};

/* =========================
   UPDATE STATUS (ADMIN)
========================= */
// export const updateQuizStatus = async (req, res) => {
//     const { status } = req.body;

//     if (!["draft", "published"].includes(status)) {
//         return res.status(400).json({ message: "Status không hợp lệ" });
//     }

//     const quiz = await Quiz.findByIdAndUpdate(
//         req.params.id,
//         {
//             status,
//             visible: status === "published",
//         },
//         { new: true }
//     );

//     res.json(quiz);
// };

export const updateQuizStatus = async (req, res) => {
    const { status } = req.body;

    if (!["draft", "published"].includes(status)) {
        return res.status(400).json({ message: "Status không hợp lệ" });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
        return res.status(404).json({ message: "Quiz không tồn tại" });
    }

    if (quiz.status === "published" && status === "draft") {
        return res.status(400).json({
            message: "Quiz đã xuất bản không thể quay lại bản nháp",
        });
    }

    quiz.status = status;
    quiz.visible = status === "published";

    await quiz.save();

    res.json(quiz);
};


export const toggleVisible = async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
        return res.status(404).json({ message: "Quiz không tồn tại" });
    }

    if (quiz.status === "draft") {
        return res.status(400).json({
            message: "Không thể hiển thị quiz khi đang ở trạng thái bản nháp",
        });
    }

    quiz.visible = !quiz.visible;
    await quiz.save();

    res.json(quiz);
};


export const getQuizDetail = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            message: "Quiz ID không hợp lệ",
        });
    }

    const quiz = await Quiz.findById(id);

    if (!quiz) {
        return res.status(404).json({ message: "Quiz không tồn tại" });
    }

    res.json({
        id: quiz._id,
        title: quiz.title,
        time_limit: quiz.time_limit,
        status: quiz.status,
        visible: quiz.visible,
        questions: quiz.questions,
    });
};

export const updateQuiz = async (req, res) => {
    const { title, time_limit, questions } = req.body;

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
        return res.status(404).json({ message: "Quiz không tồn tại" });
    }

    if (quiz.status === "published") {
        return res.status(400).json({
            message: "Quiz đã xuất bản, không thể chỉnh sửa",
        });
    }

    quiz.title = title?.trim() ?? quiz.title;
    quiz.time_limit = Number(time_limit ?? quiz.time_limit);
    

    if (Array.isArray(questions)) {
        quiz.questions.splice(0, quiz.questions.length);

        questions.forEach((q) => {
            quiz.questions.push({
                content: q.content,
                score: q.score ?? 1,
                answers: q.answers,
            });
        });
    }

    await quiz.save();

    res.json({
        message: "Cập nhật quiz thành công",
        data: quiz,
    });
};



/* =========================
   SUBMIT QUIZ (STUDENT / CLUB)
========================= */
export const submitQuiz = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { quizId } = req.params;
        const { answers } = req.body;
        const userId = req.user._id;
        const role = req.user.role;
        
        const quiz = await Quiz.findById(quizId)
            .populate("rewardActivity")
            .session(session);
            
        // const quiz = await Quiz.findById(quizId).session(session);
        if (!quiz || quiz.status !== "published") {
            return res.status(400).json({ message: "Quiz chưa được xuất bản" });
        }

        const existed = await QuizAttempt.findOne({
            quiz: quizId,
            user: userId,
        }).session(session);

        if (existed) {
            return res.status(400).json({ message: "Bạn đã làm quiz này rồi" });
        }

        let score = 0;
        quiz.questions.forEach((q, idx) => {
            const userAnswer = answers.find(a => a.question_index === idx);
            if (!userAnswer) return;

            const correctIndex = q.answers.findIndex(a => a.is_correct);
            if (userAnswer.selected_answer_index === correctIndex) {
                score += q.score;
            }
        });

        const maxScore = quiz.questions.reduce((s, q) => s + q.score, 0);
        const passed = score === maxScore;
        let earnedPoints = 0;
        if (passed) {
            earnedPoints = quiz.rewardPoint;
        }

        await QuizAttempt.create(
            [{
                quiz: quizId,
                user: userId,
                answers,
                score,
                max_score: maxScore,
                is_passed: passed,
                earned_points: earnedPoints,
            }],
            { session }
        );

        const inc = { totalScore: score };
        if (earnedPoints > 0) inc.total_points = earnedPoints;

        await Account.findByIdAndUpdate(userId, { $inc: inc }, { session });

        await session.commitTransaction();

        res.json({
            message: "Nộp bài thành công",
            score,
            maxScore,
            passed,
            earnedPoints,
        });
    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({ message: "Lỗi submit quiz" });
    } finally {
        session.endSession();
    }
};
