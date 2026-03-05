import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const MONTHS = [
    "Tháng 1", "Tháng 2", "Tháng 3",
    "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9",
    "Tháng 10", "Tháng 11", "Tháng 12",
];


const ACTIVE_BORDER =
    "bg-[linear-gradient(90deg,#5B0704_0%,#A71D0D_100%)]";

const ACTIVE_BORDER_SOFT =
    "bg-[linear-gradient(90deg,#F7DFA8_0%,#D12B1E_100%)]";

const CalendarMonthPicker = ({
    year,
    setYear,
    selected,
    onSelect,
}) => {
    return (
        <div className="p-4">
            {/* YEAR HEADER */}
            <div className="flex items-center justify-between mb-5">
                <button
                    onClick={() => setYear(y => y - 1)}
                    className="
                        p-2 rounded-full
                        text-[#4B0503]
                        hover:bg-[#F7DFA8]/50
                        transition
                    "
                >
                    <FiChevronLeft size={18} />
                </button>

                <span className="text-sm font-semibold tracking-wide text-[#4B0503]">
                    {year}
                </span>

                <button
                    onClick={() => setYear(y => y + 1)}
                    className="
                        p-2 rounded-full
                        text-[#4B0503]
                        hover:bg-[#F7DFA8]/50
                        transition
                    "
                >
                    <FiChevronRight size={18} />
                </button>
            </div>

            {/* MONTH GRID */}
            <div className="grid grid-cols-3 gap-3">
                {MONTHS.map((label, index) => {
                    const key = `${index + 1}/${year}`;
                    const active = selected === key;

                    if (active) {
                        return (
                            <div
                                key={key}
                                className="
                        p-[1.5px] rounded-xl
                        bg-[linear-gradient(90deg,#F7DFA8_0%,#D12B1E_100%)]
                    "
                            >
                                <button
                                    onClick={() => onSelect(key)}
                                    className="
                            w-full py-2.5 rounded-[10px]
                            text-sm font-medium
                            bg-white
                            text-[#4B0503]
                            transition
                        "
                                >
                                    {label}
                                </button>
                            </div>
                        );
                    }

                    return (
                        <button
                            key={key}
                            onClick={() => onSelect(key)}
                            className="
                    py-2.5 rounded-xl text-sm font-medium
                    bg-[#F7DFA8]/25
                    text-[#4B0503]
                    hover:bg-[#F7DFA8]/50
                    transition
                "
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

        </div>
    );
};

export default CalendarMonthPicker;
