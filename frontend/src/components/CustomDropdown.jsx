import { FaChevronDown, FaSearch } from "react-icons/fa";
import { useState, useMemo } from "react";

const CustomDropdown = ({
    refProp,
    open,
    setOpen,
    value,
    onChange,
    options,
    placeholder,
    label,
    searchable = false,
    disabled = false,
}) => {
    const [search, setSearch] = useState("");

    const selectedOption = options.find(opt => opt.value === value);

    const filteredOptions = useMemo(() => {
        if (!searchable || !search.trim()) return options;
        return options.filter(opt =>
            opt.label.toLowerCase().includes(search.toLowerCase())
        );
    }, [search, options, searchable]);

    return (
        <div className="relative" ref={refProp}>
            <label className="block text-sm mb-1 font-medium text-[#4B0503]">
                {label}
            </label>

            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setOpen(!open)}
                className={`w-full px-4 py-3 rounded-md border flex justify-between items-center
                    ${disabled
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "hover:border-[#B40001] text-[#4B0503]"
                    }`}
            >
                <span className={value ? "" : "text-gray-400"}>
                    {selectedOption
                        ? selectedOption.label
                        : typeof value === "string" && value.length > 0
                            ? value
                            : placeholder}
                </span>

                <FaChevronDown
                    className={`transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div className="absolute z-30 mt-1 w-full bg-white border rounded-md shadow-xl">

                    {/* SEARCH */}
                    {searchable && (
                        <div className="p-2 border-b flex items-center gap-2">
                            <FaSearch className="text-gray-400 text-sm" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Tìm kiếm..."
                                className="w-full outline-none text-sm"
                            />
                        </div>
                    )}

                    <div className="max-h-64 overflow-y-auto">
                        {filteredOptions.length === 0 && (
                            <div className="px-4 py-3 text-sm text-gray-400">
                                Không tìm thấy
                            </div>
                        )}

                        {filteredOptions.map(opt => (
                            <div
                                key={opt.value}
                                onClick={() => {
                                    onChange(opt.value);
                                    setOpen(false);
                                    setSearch("");
                                }}
                                className="px-4 py-3 cursor-pointer hover:bg-[#F7DFA8]/30"
                            >
                                {opt.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
