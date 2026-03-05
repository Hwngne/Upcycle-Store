import { Outlet } from "react-router-dom";
import Sidebar from "@/pages/Sidebar";


const MainLayout = () => {
    return (
        <div className="flex h-screen bg-[#FAF4E5] ">
            <Sidebar />
            <main className="flex-1 overflow-y-auto overflow-x-hidden h-full custom-scrollbar">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
