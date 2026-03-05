import React from "react";

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center bg-slate-50">
            <img
                src="/404_NotFound.png"
                alt="not found"
                className="w-96 mb-6 max-w-full"
            />

            <p className="text-2xl font-bold text-gray-800">
                Không tìm thấy trang
            </p>

            {/* <a
                href="/"
                className="inline-block px-6 py-3 mt-6 font-medium text-white transition shadow-md bg-primary rounded-2xl hover:bg-primary-dark"
            >
                Quay về trang chủ
            </a> */}
        </div>
    );
};

export default NotFound;
