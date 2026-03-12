// import React, { useState, useEffect } from "react";


// const CreateAdminAccountModal = ({ isOpen, onClose, onSubmit }) => {
//     const [formData, setFormData] = useState({
//         email: "",
//         role: "admin",
//         admin_name: "",
//         admin_gender: "",
//         admin_phone: "",
//     });

//     const [genderOpen, setGenderOpen] = useState(false);

//     useEffect(() => {
//         if (!isOpen) {
//             setGenderOpen(false);
//         }
//     }, [isOpen]);


//     // const [genderOpen, setGenderOpen] = useState(false);

//     if (!isOpen) return null;

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));
//     };

//     const handleSubmit = () => {
//         onSubmit(formData);
//         onClose();
//         setFormData({
//             email: "",
//             role: "admin",
//             admin_name: "",
//             admin_gender: "",
//             admin_phone: "",
//         });
//     };

//     const handleInputFocus = () => {
//         setGenderOpen(false);
//     };

//     return (
//         <div
//             className="fixed inset-0 z-50 flex items-center justify-center"
//             onClick={onClose}
//         >
//             {/* Overlay */}
//             <div className="absolute inset-0 bg-black/40" />

//             {/* Modal */}
//             <div
//                 className="relative z-10 w-[420px] rounded-xl bg-white p-6 shadow-lg"
//                 onClick={(e) => e.stopPropagation()}
//             >
//                 {/* Header */}
//                 <div className="flex justify-between items-center mb-4">
//                     <h3 className="text-lg font-bold text-[#4B0503]">
//                         Tạo tài khoản Admin
//                     </h3>
//                     <button
//                         onClick={onClose}
//                         className="text-gray-500 hover:text-gray-700 text-xl font-bold cursor-pointer"
//                     >
//                         ×
//                     </button>
//                 </div>

//                 {/* Form */}
//                 <div className="space-y-4">
//                     {/* Họ tên */}
//                     <div>
//                         <label className="block text-sm mb-1 text-[#4B0503]">
//                             Họ và tên Admin
//                         </label>
//                         <input
//                             name="admin_name"
//                             value={formData.admin_name}
//                             onChange={handleChange}
//                             onFocus={handleInputFocus}
//                             className="w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001]"
//                         />
//                     </div>

//                     {/* Email */}
//                     <div>
//                         <label className="block text-sm mb-1 text-[#4B0503]">
//                             Email
//                         </label>
//                         <input
//                             name="email"
//                             type="email"
//                             value={formData.email}
//                             onChange={handleChange}
//                             onFocus={handleInputFocus}
//                             className="w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001]"
//                         />
//                     </div>

//                     {/* ====== DROPDOWN GIỚI TÍNH (STYLE GIỐNG STUDENT) ====== */}
//                     <div className="relative">
//                         <label className="block text-sm mb-1 text-[#4B0503]">
//                             Giới tính
//                         </label>

//                         <div
//                             className="w-full rounded-md border px-3 py-2 cursor-pointer flex justify-between items-center outline-none focus:border-[#B40001]"
//                             onClick={() => setGenderOpen(!genderOpen)}
//                         >
//                             {formData.admin_gender
//                                 ? formData.admin_gender === "M"
//                                     ? "Nam"
//                                     : "Nữ"
//                                 : "Chọn giới tính"}

//                             <svg
//                                 className={`w-4 h-4 ml-2 transition-transform duration-200 ${genderOpen ? "rotate-180" : ""
//                                     }`}
//                                 fill="none"
//                                 stroke="currentColor"
//                                 viewBox="0 0 24 24"
//                             >
//                                 <path
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     strokeWidth={2}
//                                     d="M19 9l-7 7-7-7"
//                                 />
//                             </svg>
//                         </div>

//                         {genderOpen && (
//                             <div className="absolute mt-1 w-full bg-[#4B0503]/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg overflow-hidden z-50">
//                                 <ul className="text-[#4B0503]">
//                                     {[
//                                         { label: "Nam", value: "M" },
//                                         { label: "Nữ", value: "F" },
//                                     ].map((g) => (
//                                         <li
//                                             key={g.value}
//                                             className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer transition"
//                                             onClick={() => {
//                                                 setFormData((prev) => ({
//                                                     ...prev,
//                                                     admin_gender: g.value,
//                                                 }));
//                                                 setGenderOpen(false);
//                                             }}
//                                         >
//                                             {g.label}
//                                         </li>
//                                     ))}
//                                 </ul>
//                             </div>
//                         )}
//                     </div>
//                     {/* ====== END DROPDOWN ====== */}

//                     {/* Số điện thoại */}
//                     <div>
//                         <label className="block text-sm mb-1 text-[#4B0503]">
//                             Số điện thoại
//                         </label>
//                         <input
//                             name="admin_phone"
//                             value={formData.admin_phone}
//                             onChange={handleChange}
//                             onFocus={handleInputFocus}
//                             className="w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001]"
//                         />
//                     </div>
//                 </div>

//                 {/* Footer */}
//                 <div className="flex justify-end gap-3 mt-6">
//                     <button
//                         onClick={onClose}
//                         className="px-4 py-2 rounded-md border cursor-pointer text-gray-600 hover:bg-gray-100"
//                     >
//                         Hủy
//                     </button>

//                     <button
//                         onClick={handleSubmit}
//                         className="relative px-4 py-2 rounded-md text-white font-semibold overflow-hidden group"
//                         style={{
//                             background:
//                                 "linear-gradient(to right, #5B0704 0%, #A71D0D 50%, #D12B1E 100%)",
//                         }}
//                     >
//                         <span
//                             className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
//                             style={{
//                                 background:
//                                     "linear-gradient(to right, #D12B1E 0%, #B40001 50%, #E5CFB5 100%)",
//                             }}
//                         />
//                         <span className="relative z-10">Lưu</span>
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CreateAdminAccountModal;



import React, { useState, useEffect } from "react";

const CreateAdminAccountModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        email: "",
        role: "admin",
        admin_name: "",
        admin_gender: "",
        admin_phone: "",
    });

    const [errors, setErrors] = useState({});
    const [genderOpen, setGenderOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setGenderOpen(false);
            setErrors({});
            setFormData({
                email: "",
                role: "admin",
                admin_name: "",
                admin_gender: "",
                admin_phone: "",
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.admin_name.trim()) {
            newErrors.admin_name = "Vui lòng nhập họ tên";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Vui lòng nhập email";
        }

        if (!formData.admin_gender) {
            newErrors.admin_gender = "Vui lòng chọn giới tính";
        }

        if (!formData.admin_phone.trim()) {
            newErrors.admin_phone = "Vui lòng nhập số điện thoại";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        setErrors({});

        if (!validateForm()) return;

        try {
            await onSubmit(formData);
            onClose();
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            }
        }
    };

    const handleInputFocus = () => {
        setGenderOpen(false);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/40" />

            <div
                className="relative z-10 w-[420px] rounded-xl bg-white p-6 shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-[#4B0503]">
                        Tạo tài khoản Admin
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl font-bold cursor-pointer"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-4">

                    {/* Họ tên */}
                    <div>
                        <label className="block text-sm mb-1 text-[#4B0503]">
                            Họ và tên Admin
                        </label>
                        <input
                            name="admin_name"
                            value={formData.admin_name}
                            onChange={handleChange}
                            onFocus={handleInputFocus}
                            className={`w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001] ${
                                errors.admin_name ? "border-red-500" : ""
                            }`}
                        />
                        {errors.admin_name && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.admin_name}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm mb-1 text-[#4B0503]">
                            Email
                        </label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            onFocus={handleInputFocus}
                            className={`w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001] ${
                                errors.email ? "border-red-500" : ""
                            }`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Giới tính */}
                    <div className="relative">
                        <label className="block text-sm mb-1 text-[#4B0503]">
                            Giới tính
                        </label>

                        <div
                            className={`w-full rounded-md border px-3 py-2 cursor-pointer flex justify-between items-center outline-none ${
                                errors.admin_gender ? "border-red-500" : ""
                            }`}
                            onClick={() => setGenderOpen(!genderOpen)}
                        >
                            {formData.admin_gender
                                ? formData.admin_gender === "M"
                                    ? "Nam"
                                    : "Nữ"
                                : "Chọn giới tính"}

                            <svg
                                className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                                    genderOpen ? "rotate-180" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </div>

                        {errors.admin_gender && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.admin_gender}
                            </p>
                        )}

                        {genderOpen && (
                            <div className="absolute mt-1 w-full bg-[#4B0503]/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg overflow-hidden z-50">
                                <ul className="text-[#4B0503]">
                                    {[{ label: "Nam", value: "M" }, { label: "Nữ", value: "F" }].map((g) => (
                                        <li
                                            key={g.value}
                                            className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer transition"
                                            onClick={() => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    admin_gender: g.value,
                                                }));
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    admin_gender: "",
                                                }));
                                                setGenderOpen(false);
                                            }}
                                        >
                                            {g.label}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Số điện thoại */}
                    <div>
                        <label className="block text-sm mb-1 text-[#4B0503]">
                            Số điện thoại
                        </label>
                        <input
                            name="admin_phone"
                            value={formData.admin_phone}
                            onChange={handleChange}
                            onFocus={handleInputFocus}
                            className={`w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001] ${
                                errors.admin_phone ? "border-red-500" : ""
                            }`}
                        />
                        {errors.admin_phone && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.admin_phone}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border cursor-pointer text-gray-600 hover:bg-gray-100"
                    >
                        Hủy
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="relative px-4 py-2 rounded-md text-white font-semibold overflow-hidden group"
                        style={{
                            background:
                                "linear-gradient(to right, #5B0704 0%, #A71D0D 50%, #D12B1E 100%)",
                        }}
                    >
                        <span
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{
                                background:
                                    "linear-gradient(to right, #D12B1E 0%, #B40001 50%, #E5CFB5 100%)",
                            }}
                        />
                        <span className="relative z-10">Lưu</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateAdminAccountModal;