import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";

const FilterDropdown = ({ label, options = [], value, onChange }) => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-4 py-2 cursor-pointer rounded-md bg-white/30 text-[#4B0503] text-sm backdrop-blur-md border border-white/30 shadow-sm"
            >
                {value || label} <FaChevronDown size={12} />
            </button>
            {open && (
                <div className="absolute mt-2 w-48 bg-[#4B0503]/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg overflow-hidden z-50">
                    <ul className="text-[#4B0503]">
                        <li
                            className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer"
                            onClick={() => { onChange(null); setOpen(false); }}
                        >
                            Tất cả
                        </li>
                        {options.map(option => (
                            <li
                                key={option}
                                className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer"
                                onClick={() => { onChange(option); setOpen(false); }}
                            >
                                {option}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default FilterDropdown;
