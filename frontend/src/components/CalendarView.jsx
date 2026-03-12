import React, { useState, useMemo } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const CalendarView = ({ events }) => {
    const [current, setCurrent] = useState(new Date());

    const year = current.getFullYear();
    const month = current.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startOffset = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const calendarDays = Array.from(
        { length: startOffset + daysInMonth },
        (_, i) =>
            i < startOffset
                ? null
                : new Date(year, month, i - startOffset + 1)
    );

    // const normalizedEvents = useMemo(() => {
    //     return events.map((e) => ({
    //         ...e,
    //         start: new Date(e.startDate.split("/").reverse().join("-")),
    //         end: new Date(e.endDate.split("/").reverse().join("-")),
    //     }));
    // }, [events]);

    const normalizedEvents = useMemo(()=>{
        return events.map((e) =>({
            ...e,
            start: e.start,
            end: e.end,
        }))
    }, [events]);

    const getEventsForDay = (date) =>
        normalizedEvents.filter(
            (e) => date >= e.start && date <= e.end
        );

    return (
        <div className="mb-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#4B0503]">
                    Tháng {month + 1}/{year}
                </h3>
                <div className="flex gap-3">
                    <button onClick={() =>
                        setCurrent(new Date(year, month - 1, 1))
                    }>
                        <FaChevronLeft />
                    </button>
                    <button onClick={() =>
                        setCurrent(new Date(year, month + 1, 1))
                    }>
                        <FaChevronRight />
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-3">
                {daysOfWeek.map((d) => (
                    <div
                        key={d}
                        className="text-center text-xs font-semibold text-[#4B0503]/70"
                    >
                        {d}
                    </div>
                ))}

                {calendarDays.map((date, i) => (
                    <div
                        key={i}
                        className="min-h-[110px] rounded-xl bg-white/30 backdrop-blur-md p-2 border border-white/30"
                    >
                        {date && (
                            <>
                                <div className="text-xs font-semibold mb-1 text-[#5B0704]">
                                    {date.getDate()}
                                </div>

                                <div className="space-y-1">
                                    {getEventsForDay(date).slice(0, 3).map((e) => (
                                        <div
                                            key={e.id}
                                            className="text-[11px] truncate px-2 py-1 rounded-md text-white"
                                            style={{
                                                background:
                                                    e.homepage && e.forum
                                                        ? "#5B0704"
                                                        : e.homepage
                                                            ? "#A71D0D"
                                                            : "#D12B1E",
                                            }}
                                        >
                                            {e.name}
                                        </div>
                                    ))}

                                    {getEventsForDay(date).length > 3 && (
                                        <div className="text-[10px] text-[#4B0503]/60">
                                            +{getEventsForDay(date).length - 3} khác
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CalendarView;
