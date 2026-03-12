import React, { useRef, useState, useMemo, useEffect } from "react";
import CustomDropdown from "@/components/CustomDropdown";
import CalendarMonthPicker from "@/components/CalendarMonthPicker";

const MonthFilterDropdown = ({ months, value, onChange }) => {
    const ref = useRef(null);
    const [open, setOpen] = useState(false);
    const displayLabel = useMemo(() => {
        if (!value) return "";
        const [m, y] = value.split("/");
        return `Tháng ${m} / ${y}`;
    }, [value]);

    /* ===== OUTSIDE CLICK ===== */
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const availableMonthKeys = useMemo(
        () => months.map(m => m.value),
        [months]
    );

    const currentYear = value
        ? Number(value.split("/")[1])
        : new Date().getFullYear();

    const [year, setYear] = useState(currentYear);

    return (
        <div className="relative" ref={ref}>
            <CustomDropdown
                open={open}
                setOpen={setOpen}
                value={displayLabel}
                onChange={() => { }}
                options={[]}
                placeholder="Chọn tháng"
                label="Tháng hiển thị"
            />


            {open && (
                <div
                    className="
                        absolute z-40 mt-2 w-full
                        bg-white/90 backdrop-blur-xl
                        rounded-2xl
                        border border-white/40
                        shadow-2xl
                        animate-in fade-in zoom-in-95
                    "
                >
                    <CalendarMonthPicker
                        year={year}
                        setYear={setYear}
                        selected={value}
                        onSelect={(monthKey) => {
                            onChange(monthKey);
                            setOpen(false);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default MonthFilterDropdown;
