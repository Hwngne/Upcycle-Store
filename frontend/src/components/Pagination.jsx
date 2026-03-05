// Pagination.jsx
import React from "react";

const Pagination = ({ currentPage, totalPages, setCurrentPage }) => {
    return (
        <div className="flex justify-center mt-6 gap-2">
            <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-3 py-1 rounded-lg text-[#4B0503] shadow-sm border border-[#B40001] transition-transform hover:scale-105 disabled:opacity-50 cursor-pointer"
                style={{ background: "#ffffff" }}
            >
                Prev
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
                const isActive = currentPage === idx + 1;
                return (
                    <button
                        key={idx}
                        onClick={() => setCurrentPage(idx + 1)}
                        className="px-3 py-1 cursor-pointer rounded-lg shadow-sm transition-transform hover:scale-105"
                        style={{
                            background: isActive
                                ? "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)"
                                : "#ffffff",
                            color: isActive ? "#ffffff" : "#4B0503",
                            border: isActive ? "none" : "1px solid #B40001",
                        }}
                    >
                        {idx + 1}
                    </button>
                );
            })}

            <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="px-3 py-1 rounded-lg text-[#4B0503] cursor-pointer shadow-sm border border-[#B40001] transition-transform hover:scale-105 disabled:opacity-50"
                style={{ background: "#ffffff" }}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
