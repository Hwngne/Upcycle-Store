export const getActorDisplayName = (user) => {
    if (!user) return "Hệ thống";

    if (user.role === "admin") return user.email; // hoặc admin_name nếu có
    if (user.role === "student") return user.email;
    if (user.role === "club") return user.email;

    return user.email;
};
