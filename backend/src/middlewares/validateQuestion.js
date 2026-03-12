export const validateQuestion = (req, res, next) => {
    const { content, answers } = req.body;

    if (!content || !Array.isArray(answers)) {
        return res.status(400).json({
            message: "Câu hỏi và danh sách đáp án là bắt buộc",
        });
    }

    if (answers.length < 2) {
        return res.status(400).json({
            message: "Mỗi câu hỏi phải có ít nhất 2 đáp án",
        });
    }

    const correctAnswers = answers.filter(a => a.is_correct === true);

    if (correctAnswers.length !== 1) {
        return res.status(400).json({
            message: "Mỗi câu hỏi phải có đúng 1 đáp án đúng",
        });
    }

    next();
};
