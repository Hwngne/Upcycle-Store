import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import { getQuizDetailApi, updateQuizApi } from "@/services/quiz.service";

/* ================= MAP ================= */

const mapQuestionsFromApi = (questions = []) =>
    questions.map((q) => ({
        id: crypto.randomUUID(),
        questionText: q.content,
        answers: q.answers.map((a) => a.content),
        correctIndex: q.answers.findIndex((a) => a.is_correct),
    }));

const mapQuestionsToApi = (questions = []) =>
    questions.map((q) => ({
        content: q.questionText,
        score: 1,
        answers: q.answers.map((ans, idx) => ({
            content: ans,
            is_correct: idx === q.correctIndex,
        })),
    }));

/* ================= COMPONENT ================= */

export default function EditQuizPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        title: "",
        time_limit: "",
        max_points: "",
        status: "draft",
        questions: [],
    });

    const MAX_QUESTIONS = 5;

    /* ================= FETCH ================= */
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await getQuizDetailApi(id);
                const data = res.data;

                setForm({
                    title: data.title,
                    time_limit: data.time_limit,
                    max_points: data.max_points,
                    status: data.status,
                    questions: mapQuestionsFromApi(data.questions),
                });
            } catch {
                toast.error("Không tìm thấy quiz");
                navigate("/quizzes");
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [id, navigate]);

    const isPublished = useMemo(
        () => form.status === "published",
        [form.status]
    );


    const handleSave = async () => {
        if (isPublished) return;

        if (!form.title.trim()) {
            toast.error("Vui lòng nhập tiêu đề quiz");
            return;
        }

        const payload = {
            title: form.title,
            time_limit: Number(form.time_limit),
            max_points: Number(form.max_points),
            questions: mapQuestionsToApi([...form.questions]),
        };

        try {
            setSaving(true);
            await updateQuizApi(id, payload);
            toast.success("Cập nhật quiz thành công");
            navigate("/quizzes");
        } catch {
            toast.error("Lỗi lưu quiz");
        } finally {
            setSaving(false);
        }
    };


    const addQuestion = () => {
        if (form.questions.length >= MAX_QUESTIONS) {
            toast.error(`Chỉ được tối đa ${MAX_QUESTIONS} câu hỏi`);
            return;
        }

        setForm((prev) => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    id: crypto.randomUUID(),
                    questionText: "",
                    answers: ["", "", "", ""],
                    correctIndex: 0,
                },
            ],
        }));
    };

    const updateQuestion = (id, key, value) => {
        setForm((prev) => ({
            ...prev,
            questions: prev.questions.map((q) =>
                q.id === id ? { ...q, [key]: value } : q
            ),
        }));
    };

    const removeQuestion = (id) => {
        if (form.questions.length <= 1) {
            toast.error("Phải có ít nhất 1 câu hỏi");
            return;
        }

        setForm((prev) => ({
            ...prev,
            questions: prev.questions.filter((q) => q.id !== id),
        }));
    };

    if (loading) return <div className="p-8">Đang tải...</div>;

    const glassGlow = `
        backdrop-blur-md
        bg-white/30
        rounded-2xl
        border border-white/30
        shadow-[0_0_20px_rgba(247,223,168,0.35)]
    `;

    /* ================= RENDER ================= */

    return (
        <div className="relative flex flex-col w-full min-h-screen p-8">
            {/* HEADER */}
            <div className="mb-8 flex items-center justify-between">
                <Link
                    to="/quizzes"
                    className="flex items-center gap-3 text-[#4B0503] hover:text-[#A71D0D] transition"
                >
                    <FaArrowLeft size={20} />
                    <span className="font-semibold text-lg">
                        Quay lại danh sách
                    </span>
                </Link>

                <h1 className="text-3xl font-bold text-[#4B0503]">
                    Chỉnh sửa bài Quiz
                </h1>

                <div className="w-[140px]" />
            </div>

            {/* FORM */}
            <section className={`${glassGlow} p-8 w-full max-w-5xl mx-auto`}>
                {isPublished && (
                    <div className="mb-6 p-4 rounded-lg bg-yellow-100 text-yellow-800 font-medium">
                        Quiz đã được xuất bản. Bạn chỉ có thể xem, không thể chỉnh sửa.
                    </div>
                )}

                {/* THÔNG TIN CHUNG */}
                <div className="mb-10 space-y-6">
                    <div>
                        <label className="block text-[#4B0503] font-semibold mb-2">
                            Tiêu đề bài quiz *
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            disabled={isPublished}
                            onChange={(e) =>
                                setForm({ ...form, title: e.target.value })
                            }
                            className="w-full px-5 py-3 rounded-lg bg-white/40 backdrop-blur-md border border-white/30 outline-none disabled:opacity-60"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[#4B0503] font-semibold mb-2">
                                Thời gian (phút) *
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={form.time_limit}
                                disabled={isPublished}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        time_limit: e.target.value,
                                    })
                                }
                                className="w-full px-5 py-3 rounded-lg bg-white/40 backdrop-blur-md border border-white/30 outline-none disabled:opacity-60"
                            />
                        </div>

                        {/* <div>
                            <label className="block text-[#4B0503] font-semibold mb-2">
                                Điểm tối đa *
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={form.max_points}
                                disabled={isPublished}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        max_points: e.target.value,
                                    })
                                }
                                className="w-full px-5 py-3 rounded-lg bg-white/40 backdrop-blur-md border border-white/30 outline-none disabled:opacity-60"
                            />
                        </div> */}
                    </div>
                </div>

                {/* QUESTIONS */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-[#4B0503]">
                            Câu hỏi ({form.questions.length}/{MAX_QUESTIONS})
                        </h2>

                        {!isPublished && (
                            <button
                                onClick={addQuestion}
                                disabled={form.questions.length >= MAX_QUESTIONS}
                                className="flex items-center gap-2 px-5 py-2 rounded-lg text-white font-medium shadow-lg transition disabled:opacity-50"
                                style={{
                                    background:
                                        "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)",
                                }}
                            >
                                <FaPlus />
                                Thêm câu hỏi
                            </button>
                        )}

                    </div>

                    {form.questions.map((q, qIndex) => (
                        <div
                            key={q.id}
                            className="p-6 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-md"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-lg font-semibold text-[#4B0503]">
                                    Câu {qIndex + 1}
                                </span>

                                {!isPublished && (
                                    <button
                                        onClick={() => removeQuestion(q.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <FaTrash size={18} />
                                    </button>
                                )}
                            </div>

                            <input
                                type="text"
                                value={q.questionText}
                                disabled={isPublished}
                                onChange={(e) =>
                                    updateQuestion(
                                        q.id,
                                        "questionText",
                                        e.target.value
                                    )
                                }
                                placeholder="Nhập nội dung câu hỏi..."
                                className="w-full mb-5 px-5 py-3 rounded-lg bg-white/40 backdrop-blur-md border border-white/30 outline-none"
                            />

                            <div className="space-y-4">
                                {q.answers.map((answer, aIndex) => (
                                    <div
                                        key={aIndex}
                                        className="flex items-center gap-4"
                                    >
                                        <input
                                            type="radio"
                                            name={`correct-${q.id}`}
                                            checked={q.correctIndex === aIndex}
                                            disabled={isPublished}
                                            onChange={() =>
                                                updateQuestion(
                                                    q.id,
                                                    "correctIndex",
                                                    aIndex
                                                )
                                            }
                                        />
                                        <input
                                            type="text"
                                            value={answer}
                                            disabled={isPublished}
                                            onChange={(e) => {
                                                const newAnswers = [...q.answers];
                                                newAnswers[aIndex] =
                                                    e.target.value;
                                                updateQuestion(
                                                    q.id,
                                                    "answers",
                                                    newAnswers
                                                );
                                            }}
                                            placeholder={`Đáp án ${aIndex + 1}`}
                                            className="flex-1 px-5 py-3 rounded-lg bg-white/40 backdrop-blur-md border border-white/30 outline-none"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ACTION */}
                {!isPublished && (
                    <div className="mt-12 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-10 py-4 rounded-lg text-white font-bold text-lg shadow-lg disabled:opacity-50"
                            style={{
                                background:
                                    "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)",
                            }}
                        >
                            {saving ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}
