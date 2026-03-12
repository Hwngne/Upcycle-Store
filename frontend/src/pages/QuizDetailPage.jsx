import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    FaArrowLeft,
    FaClock,
    FaEye,
    FaQuestionCircle,
} from "react-icons/fa";
import PageHeader from "@/components/PageHeader";
import HeaderWithAvatar from "@/components/HeaderWithAvatar";
import { getQuizDetailApi } from "@/services/quiz.service";
import { QUIZ_STATUS } from "@/constants/quizStatus";

const QuizDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const from = location.state?.from ?? "/quizzes";
    
    
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await getQuizDetailApi(id);
                setQuiz(res.data);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="p-10 text-center text-[#4B0503]">
                Đang tải dữ liệu...
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="p-10 text-center text-red-600">
                Không tìm thấy bài quiz
            </div>
        );
    }

    return (
        <div className="p-8 min-h-screen bg-gradient-to-br from-[#FFF7E6] to-[#FDEEDC]">
            <PageHeader
                icon={<FaQuestionCircle className="text-3xl" />}
                title="Chi tiết bài Quiz"
                subtitle="Xem toàn bộ nội dung bài trắc nghiệm"
                right={<HeaderWithAvatar />}
            />

            {/* BACK */}
            <button
                onClick={() => navigate(from)}
                className="flex items-center gap-2 mt-6 mb-6 cursor-pointer text-[#4B0503] hover:underline"
            >
                <FaArrowLeft /> Quay lại danh sách
            </button>


            {/* MAIN CARD */}
            <div className="bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 p-8">
                {/* TITLE */}
                <h1 className="text-2xl font-bold text-[#4B0503] mb-6">
                    {quiz.title}
                </h1>

                {/* INFO */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <InfoBox
                        icon={<FaClock />}
                        label="Thời gian"
                        value={`${quiz.time_limit} phút`}
                    />
                    
                    <InfoBox
                        icon={<FaEye />}
                        label="Hiển thị"
                        value={quiz.visible ? "Đang hiển thị" : "Đang ẩn"}
                    />
                    <InfoBox
                        label="Trạng thái"
                        value={
                            <span
                                className="px-3 py-1 rounded-full text-xs text-white font-semibold"
                                style={{
                                    background:
                                        QUIZ_STATUS[quiz.status].color,
                                }}
                            >
                                {QUIZ_STATUS[quiz.status].label}
                            </span>
                        }
                    />
                </div>

                {/* QUESTIONS */}
                <h2 className="text-lg font-semibold text-[#4B0503] mb-4">
                    Danh sách câu hỏi
                </h2>

                <div className="space-y-5">
                    {quiz.questions.map((q, qi) => (
                        <div
                            key={qi}
                            className="rounded-xl border border-white/40 bg-white/60 shadow-sm p-5"
                        >
                            <p className="font-semibold mb-3 text-[#4B0503]">
                                Câu {qi + 1}: {q.content}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {q.answers.map((a, ai) => {
                                    const isCorrect = a.is_correct;
                                    return (
                                        <div
                                            key={ai}
                                            className={`px-4 py-2 rounded-lg text-sm border transition
                                                ${isCorrect
                                                    ? "bg-green-100 border-green-300 text-green-800 font-semibold"
                                                    : "bg-white border-gray-200 text-gray-700"
                                                }`}
                                        >
                                            {String.fromCharCode(65 + ai)}.{" "}
                                            {a.content}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/* ================= SUB COMPONENT ================= */

const InfoBox = ({ icon, label, value }) => (
    <div className="flex items-center gap-3 bg-white/60 rounded-xl p-4 shadow-sm border border-white/40">
        <div className="text-[#B40001] text-xl">{icon}</div>
        <div className="text-sm">
            <div className="text-gray-500">{label}</div>
            <div className="font-semibold text-[#4B0503]">{value}</div>
        </div>
    </div>
);

export default QuizDetailPage;
