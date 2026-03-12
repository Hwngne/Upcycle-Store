import React, { useState } from "react";
import { FaPlus, FaTrash, FaArrowLeft } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createQuizApi } from "@/services/quiz.service";

const CreateQuizPage = () => {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [timeLimit, setTimeLimit] = useState("15"); // phút
    //const [maxPoints, setMaxPoints] = useState("10");
    const [questions, setQuestions] = useState([
        {
            id: Date.now(),
            questionText: "",
            answers: ["", "", "", ""],
            correctIndex: 0, // index của đáp án đúng
        },
    ]);
    const [status, setStatus] = useState("draft");
    const MAX_QUESTIONS = 5;

    const addQuestion = () => {
        if (questions.length >= MAX_QUESTIONS) {
            toast.error(`Chỉ được tạo tối đa ${MAX_QUESTIONS} câu hỏi`);
            return;
        }
        setQuestions([
            ...questions,
            {
                id: Date.now(),
                questionText: "",
                answers: ["", "", "", ""],
                correctIndex: 0,
            },
        ]);
    };

    const removeQuestion = (id) => {
        if (questions.length <= 1) {
            toast.error("Phải có ít nhất 1 câu hỏi");
            return;
        }
        setQuestions(questions.filter((q) => q.id !== id));
    };

    const updateQuestion = (id, field, value, answerIndex = null) => {
        setQuestions(
            questions.map((q) =>
                q.id === id
                    ? {
                        ...q,
                        [field]: field === "answers" ? value : field === "correctIndex" ? value : value,
                        ...(field === "answers" && { answers: value }),
                        ...(field === "correctIndex" && { correctIndex: value }),
                    }
                    : q
            )
        );
    };

    const handleSubmit = async () => {
        // ===== VALIDATION (GIỮ NGUYÊN) =====
        if (!title.trim()) {
            toast.error("Vui lòng nhập tiêu đề bài quiz");
            return;
        }

        // ===== BUILD PAYLOAD ĐÚNG BACKEND =====
        const payload = {
            title: title.trim(),
            time_limit: Number(timeLimit),
            //max_points: Number(maxPoints),
            status,
            questions: questions.map((q) => ({
                content: q.questionText,
                answers: q.answers.map((ans, index) => ({
                    content: ans,
                    is_correct: index === q.correctIndex,
                })),
                score: 1,
            })),
        };

        try {
            await createQuizApi(payload);
            toast.success("Tạo bài quiz thành công!");
            navigate("/quizzes");
        } catch (err) {
            toast.error(err.response?.data?.message || "Tạo quiz thất bại");
        }
    };


    const glassGlow = `
    backdrop-blur-md
    bg-white/30
    rounded-2xl
    border border-white/30
    shadow-[0_0_20px_rgba(247,223,168,0.35)]
  `;

  
    return (
        <div className="relative flex flex-col w-full min-h-screen p-8 bg-[#fff0]">
            {/* HEADER */}
            <div className="mb-8 flex items-center justify-between">
                <Link
                    to="/quizzes"
                    className="flex items-center gap-3 text-[#4B0503] hover:text-[#A71D0D] transition"
                >
                    <FaArrowLeft size={20} />
                    <span className="font-semibold text-lg">Quay lại danh sách</span>
                </Link>

                <h1 className="text-3xl font-bold text-[#4B0503]">
                    Tạo Bài Quiz Mới
                </h1>

                <div className="w-[120px]" /> {/* placeholder để cân bằng */}
            </div>

            {/* FORM */}
            <section className={`${glassGlow} p-8 w-full max-w-5xl mx-auto`}>
                {/* Thông tin chung */}
                <div className="mb-10 space-y-6">
                    <div>
                        <label className="block text-[#4B0503] font-semibold mb-2">
                            Tiêu đề bài quiz <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ví dụ: Kiến thức về môi trường và sức khỏe"
                            className="w-full px-5 py-3 rounded-lg bg-white/40 backdrop-blur-md border border-white/30 text-[#4B0503] outline-none focus:border-[#A71D0D]"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[#4B0503] font-semibold mb-2">
                                Thời gian giới hạn (phút) <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={timeLimit}
                                onChange={(e) => setTimeLimit(e.target.value)}
                                className="w-full px-5 py-3 rounded-lg bg-white/40 backdrop-blur-md border border-white/30 text-[#4B0503] outline-none focus:border-[#A71D0D]"
                            />
                        </div>

                        {/* <div>
                            <label className="block text-[#4B0503] font-semibold mb-2">
                                Điểm tối đa <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={maxPoints}
                                onChange={(e) => setMaxPoints(e.target.value)}
                                className="w-full px-5 py-3 rounded-lg bg-white/40 backdrop-blur-md border border-white/30 text-[#4B0503] outline-none focus:border-[#A71D0D]"
                            />
                        </div> */}

                        
                    </div>

                    <div>
                        <label className="block text-[#4B0503] font-semibold mb-2">
                            Trạng thái bài quiz <span className="text-red-600">*</span>
                        </label>

                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value="draft"
                                    checked={status === "draft"}
                                    onChange={() => setStatus("draft")}
                                />
                                <span>Bản nháp</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value="published"
                                    checked={status === "published"}
                                    onChange={() => setStatus("published")}
                                />
                                <span>Xuất bản ngay</span>
                            </label>
                        </div>
                    </div>

                </div>

                {/* Danh sách câu hỏi */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-[#4B0503]">
                            Câu hỏi ({questions.length}/{MAX_QUESTIONS})
                        </h2>
                        <button
                            onClick={addQuestion}
                            disabled={questions.length >= MAX_QUESTIONS}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg text-white font-medium shadow-lg hover:shadow-xl transition disabled:opacity-50"
                            style={{
                                background: "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)",
                            }}
                        >
                            <FaPlus />
                            Thêm câu hỏi
                        </button>
                    </div>

                    {questions.map((q, qIndex) => (
                        <div
                            key={q.id}
                            className="p-6 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-md"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-lg font-semibold text-[#4B0503]">
                                    Câu {qIndex + 1}
                                </span>
                                {questions.length > 1 && (
                                    <button
                                        onClick={() => removeQuestion(q.id)}
                                        className="text-red-600 hover:text-red-800 transition"
                                    >
                                        <FaTrash size={20} />
                                    </button>
                                )}
                            </div>

                            <input
                                type="text"
                                value={q.questionText}
                                onChange={(e) =>
                                    updateQuestion(q.id, "questionText", e.target.value)
                                }
                                placeholder="Nhập nội dung câu hỏi..."
                                className="w-full mb-5 px-5 py-3 rounded-lg bg-white/40 backdrop-blur-md border border-white/30 text-[#4B0503] outline-none focus:border-[#A71D0D]"
                            />

                            <div className="space-y-4">
                                {q.answers.map((answer, aIndex) => (
                                    <div key={aIndex} className="flex items-center gap-4">
                                        <input
                                            type="radio"
                                            name={`correct-${q.id}`}
                                            checked={q.correctIndex === aIndex}
                                            onChange={() => updateQuestion(q.id, "correctIndex", aIndex)}
                                            className="w-5 h-5 text-[#A71D0D] focus:ring-[#A71D0D]"
                                        />
                                        <input
                                            type="text"
                                            value={answer}
                                            onChange={(e) => {
                                                const newAnswers = [...q.answers];
                                                newAnswers[aIndex] = e.target.value;
                                                updateQuestion(q.id, "answers", newAnswers);
                                            }}
                                            placeholder={`Đáp án ${aIndex + 1}`}
                                            className="flex-1 px-5 py-3 rounded-lg bg-white/40 backdrop-blur-md border border-white/30 text-[#4B0503] outline-none focus:border-[#A71D0D]"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Nút lưu */}
                <div className="mt-12 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        className="px-10 py-4 rounded-lg text-white font-bold text-lg shadow-lg hover:shadow-xl transition"
                        style={{
                            background: "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)",
                        }}
                    >
                        Tạo bài quiz
                    </button>
                </div>
            </section>
        </div>
    );
};

export default CreateQuizPage;