import { Navigate, useLocation } from "react-router-dom";

const RequireChangePassword = ({ children }) => {
    const location = useLocation();

    const isFirstLogin = sessionStorage.getItem("isFirstLogin");
    const fromLogin = location.state?.fromLogin;

    if (isFirstLogin !== "true" || !fromLogin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default RequireChangePassword;
