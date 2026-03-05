import api from "./api";

export const getArticlesApi = () =>
    api.get("/articles");


export const createArticleApi = async (formData) => {
    // Log formData để kiểm tra dữ liệu gửi
    console.log("Dữ liệu gửi lên server (formData):");
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? '[File: ' + value.name + ']' : value}`);
    }

    try {
        // Dùng instance 'api' đã config baseURL + auth
        const res = await api.post("/articles", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log("Response từ server:", res.data);
        return res;
    } catch (err) {
        // Log lỗi chi tiết
        if (err.response) {
            console.error("Lỗi từ server:", err.response.status, err.response.data);
        } else if (err.request) {
            console.error("Không nhận response:", err.request);
        } else {
            console.error("Lỗi setup request:", err.message);
        }
        throw err; // ném lỗi để component cha catch
    }
};

export const updateArticleApi = (id, data) =>
    api.put(`/articles/${id}`, data);

export const deleteArticleApi = (id) =>
    api.delete(`/articles/${id}`);
