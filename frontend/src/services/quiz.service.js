import api from "./api";

// export const getQuizzesApi = () =>
//     api.get("/quizzes");
export const getQuizzesApi = async () => {
    try {
        const res = await api.get("/quizzes");
        console.log("Response quiz từ API:", res.data); // log toàn bộ response
        return res;
    } catch (err) {
        console.error("Lỗi get quizzes:", err);
        throw err;
    }
};
export const createQuizApi = (data) =>
    api.post("/quizzes", data);

// export const updateQuizApi = (id, data) =>
//     api.put(`/quizzes/${id}`, data);

export const deleteQuizApi = (id) =>
    api.delete(`/quizzes/${id}`);
 
export const updateQuizStatusApi = (id, status) =>
    api.patch(`/quizzes/${id}/status`, { status });

export const updateQuizVisibleApi = (id) =>
    api.patch(`/quizzes/${id}/visible`);

export const getQuizDetailApi =(id) =>
    api.get(`/quizzes/${id}`);

export const updateQuizApi = (id, data) =>
    api.put(`/quizzes/${id}`, data);

