import React, { useState, useEffect } from "react";

const NumberInputWithButtons = ({ value, onChange, min = 0, max = Infinity }) => {
    const [inputValue, setInputValue] = useState(value?.toString() ?? "");

    // Đồng bộ khi value từ ngoài thay đổi
    useEffect(() => {
        setInputValue(value?.toString() ?? "");
    }, [value]);

    return (
        <div className="flex items-center justify-center gap-2">
            <button
                className="px-2 py-1 rounded-full cursor-pointer text-white transition-transform hover:scale-105"
                style={{ background: "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)" }}
                onClick={() => {
                    const newVal = Math.max(min, (Number(value) || 0) - 1);
                    onChange(newVal);
                }}
            >
                -
            </button>

            <input
                type="text" // ⚠️ đổi sang text để tránh browser auto ép 0
                className="w-12 text-center rounded-full border border-[#B40001]/50 outline-none px-2 py-1 appearance-none"
                value={inputValue}
                onChange={(e) => {
                    const val = e.target.value;

                    // Cho phép xóa hết
                    if (val === "") {
                        setInputValue("");
                        return;
                    }

                    // Chỉ cho nhập số
                    if (!/^\d+$/.test(val)) return;

                    const num = Math.min(Math.max(Number(val), min), max);
                    setInputValue(val);
                    onChange(num);
                }}
                onBlur={() => {
                    // Khi blur mà rỗng → set về min
                    if (inputValue === "") {
                        setInputValue(min.toString());
                        onChange(min);
                    }
                }}
            />

            <button
                className="px-2 py-1 rounded-full cursor-pointer text-white transition-transform hover:scale-105"
                style={{ background: "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)" }}
                onClick={() => {
                    const newVal = Math.min(max, (Number(value) || 0) + 1);
                    onChange(newVal);
                }}
            >
                +
            </button>
        </div>
    );
};

export default NumberInputWithButtons;
