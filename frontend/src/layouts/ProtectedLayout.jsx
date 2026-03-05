// import { Navigate, Outlet } from "react-router-dom";

// const ProtectedLayout = ({ role }) => {
//     const token = localStorage.getItem("token");
//     const user = JSON.parse(localStorage.getItem("user"));

//     if (!token || !user) {
//         return <Navigate to="/" replace />;
//     }

//     if (role && user.role !== role) {
//         return <Navigate to="/403" replace />;
//     }

//     return <Outlet />;
// };

// export default ProtectedLayout;


import { Navigate, Outlet } from "react-router-dom";

const ProtectedLayout = ({ role }) => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user) {
        return <Navigate to="/" replace />;
    }

    // Nếu user chưa đổi mật khẩu, redirect sang ChangePassword
    if (user.change_password) {
        return <Navigate to="/change-password" replace />;
    }

    // Kiểm tra role (nếu có)
    if (role && user.role !== role) {
        return <Navigate to="/403" replace />;
    }

    return <Outlet />;
};

export default ProtectedLayout;
