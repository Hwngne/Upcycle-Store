// import React, { useState, useEffect } from "react";

// const CreateStudentAccountModal = ({ isOpen, onClose, onSubmit }) => {
//     const [formData, setFormData] = useState({
//         student_code: "",   // ← ĐÚNG tên field backend cần
//         student_name: "",   // ← ĐÚNG tên field
//         email: "",
//         gender: "",         // ← sẽ là "M" hoặc "F"
//     });
    
//     const [genderOpen, setGenderOpen] = useState(false);

//     useEffect(() => {
//         if (!isOpen) {
//             setGenderOpen(false);
//             // Reset form khi đóng
//             setFormData({
//                 student_code: "",
//                 student_name: "",
//                 email: "",
//                 gender: "",
//             });
//         }
//     }, [isOpen]);

//     if (!isOpen) return null;

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));
//     };

//     const handleSubmit = () => {
//         // Chuẩn hóa dữ liệu trước khi gửi
//         const submitData = {
//             email: formData.email.trim(),
//             role: "student",
//             student_code: formData.student_code.trim(),
//             student_name: formData.student_name.trim(),
//             gender: formData.gender, // đã là "M" hoặc "F"
//         };

//         onSubmit(submitData);
//         onClose();
//     };

//     const handleInputFocus = () => {
//         setGenderOpen(false);
//     };

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
//             {/* Overlay */}
//             <div className="absolute inset-0 bg-black/40" />

//             {/* Modal */}
//             <div
//                 className="relative z-10 w-[420px] rounded-xl bg-white p-6 shadow-lg"
//                 onClick={(e) => e.stopPropagation()}
//             >
//                 {/* Header */}
//                 <div className="flex justify-between items-center mb-4">
//                     <h3 className="text-lg font-bold text-[#4B0503]">Tạo tài khoản Sinh viên</h3>
//                     <button
//                         onClick={onClose}
//                         className="text-gray-500 hover:text-gray-700 text-xl font-bold cursor-pointer"
//                     >
//                         ×
//                     </button>
//                 </div>

//                 {/* Form */}
//                 <div className="space-y-4">
//                     <div>
//                         <label className="block text-sm mb-1 text-[#4B0503]">Mã số sinh viên</label>
//                         <input
//                             name="student_code"        // ← ĐÚNG tên
//                             value={formData.student_code}
//                             onChange={handleChange}
//                             onFocus={handleInputFocus}
//                             placeholder="13 chữ số"
//                             className="w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001]"
//                         />
//                     </div>

//                     <div>
//                         <label className="block text-sm mb-1 text-[#4B0503]">Họ và tên</label>
//                         <input
//                             name="student_name"        // ← ĐÚNG tên
//                             value={formData.student_name}
//                             onChange={handleChange}
//                             onFocus={handleInputFocus}
//                             className="w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001]"
//                         />
//                     </div>

//                     <div>
//                         <label className="block text-sm mb-1 text-[#4B0503]">Email (@vanlanguni.vn)</label>
//                         <input
//                             name="email"
//                             value={formData.email}
//                             onChange={handleChange}
//                             onFocus={handleInputFocus}
//                             type="email"
//                             placeholder="abc123@vanlanguni.vn"
//                             className="w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001]"
//                         />
//                     </div>

//                     <div className="relative">
//                         <label className="block text-sm mb-1 text-[#4B0503]">Giới tính</label>
//                         <div
//                             className="w-full rounded-md border px-3 py-2 cursor-pointer flex justify-between items-center outline-none focus:border-[#B40001]"
//                             onClick={() => setGenderOpen(!genderOpen)}
//                         >
//                             {formData.gender === "M" ? "Nam" : formData.gender === "F" ? "Nữ" : "Chọn giới tính"}
//                             <svg
//                                 className={`w-4 h-4 ml-2 transition-transform duration-200 ${genderOpen ? "rotate-180" : ""}`}
//                                 fill="none"
//                                 stroke="currentColor"
//                                 viewBox="0 0 24 24"
//                             >
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                             </svg>
//                         </div>
//                         {genderOpen && (
//                             <div className="absolute mt-1 w-full bg-[#4B0503]/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg overflow-hidden z-50">
//                                 <ul className="text-[#4B0503]">
//                                     <li
//                                         className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer transition"
//                                         onClick={() => {
//                                             setFormData(prev => ({ ...prev, gender: "M" })); // ← Gửi "M"
//                                             setGenderOpen(false);
//                                         }}
//                                     >
//                                         Nam
//                                     </li>
//                                     <li
//                                         className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer transition"
//                                         onClick={() => {
//                                             setFormData(prev => ({ ...prev, gender: "F" })); // ← Gửi "F"
//                                             setGenderOpen(false);
//                                         }}
//                                     >
//                                         Nữ
//                                     </li>
//                                 </ul>
//                             </div>
//                         )}
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
//                         className="px-4 py-2 rounded-md text-white cursor-pointer font-medium"
//                         style={{ background: "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)" }}
//                     >
//                         Tạo tài khoản
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CreateStudentAccountModal;


import React, { useState, useEffect } from "react";

const CreateStudentAccountModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        student_code: "",
        student_name: "",
        email: "",
        gender: "",
    });

    const [genderOpen, setGenderOpen] = useState(false);
    const [errors, setErrors] = useState({}); // ✅ thêm

    useEffect(() => {
        if (!isOpen) {
            setGenderOpen(false);
            setErrors({}); // ✅ reset lỗi
            setFormData({
                student_code: "",
                student_name: "",
                email: "",
                gender: "",
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // ✅ xoá lỗi khi nhập lại
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleSubmit = () => {
        const newErrors = {};

        // ===== VALIDATE MSSV =====
        if (!formData.student_code.trim()) {
            newErrors.student_code = "Vui lòng nhập mã số sinh viên";
        } else if (!/^\d{13}$/.test(formData.student_code.trim())) {
            newErrors.student_code = "Mã số sinh viên phải đủ 13 chữ số";
        }

        // ===== VALIDATE HỌ TÊN =====
        if (!formData.student_name.trim()) {
            newErrors.student_name = "Vui lòng nhập họ và tên";
        }

        // ===== VALIDATE EMAIL =====
        if (!formData.email.trim()) {
            newErrors.email = "Vui lòng nhập email";
        } else if (!formData.email.endsWith("@vanlanguni.vn")) {
            newErrors.email = "Email phải có đuôi @vanlanguni.vn";
        }

        // ===== VALIDATE GIỚI TÍNH =====
        if (!formData.gender) {
            newErrors.gender = "Vui lòng chọn giới tính";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const submitData = {
            email: formData.email.trim(),
            role: "student",
            student_code: formData.student_code.trim(),
            student_name: formData.student_name.trim(),
            gender: formData.gender,
        };

        onSubmit(submitData);
        onClose();
    };

    const handleInputFocus = () => {
        setGenderOpen(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40" />

            <div
                className="relative z-10 w-[420px] rounded-xl bg-white p-6 shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-[#4B0503]">
                        Tạo tài khoản Sinh viên
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl font-bold cursor-pointer"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-4">
                    {/* MSSV */}
                    <div>
                        <label className="block text-sm mb-1 text-[#4B0503]">
                            Mã số sinh viên
                        </label>
                        <input
                            name="student_code"
                            value={formData.student_code}
                            onChange={handleChange}
                            onFocus={handleInputFocus}
                            placeholder="13 chữ số"
                            className={`w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001] ${errors.student_code ? "border-red-500" : ""
                                }`}
                        />
                        {errors.student_code && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.student_code}
                            </p>
                        )}
                    </div>

                    {/* Họ tên */}
                    <div>
                        <label className="block text-sm mb-1 text-[#4B0503]">
                            Họ và tên
                        </label>
                        <input
                            name="student_name"
                            value={formData.student_name}
                            onChange={handleChange}
                            onFocus={handleInputFocus}
                            className={`w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001] ${errors.student_name ? "border-red-500" : ""
                                }`}
                        />
                        {errors.student_name && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.student_name}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm mb-1 text-[#4B0503]">
                            Email (@vanlanguni.vn)
                        </label>
                        <input
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onFocus={handleInputFocus}
                            type="email"
                            placeholder="abc123@vanlanguni.vn"
                            className={`w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001] ${errors.email ? "border-red-500" : ""
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
                            className={`w-full rounded-md border px-3 py-2 cursor-pointer flex justify-between items-center outline-none focus:border-[#B40001] ${errors.gender ? "border-red-500" : ""
                                }`}
                            onClick={() => setGenderOpen(!genderOpen)}
                        >
                            {formData.gender === "M"
                                ? "Nam"
                                : formData.gender === "F"
                                    ? "Nữ"
                                    : "Chọn giới tính"}
                            <svg
                                className={`w-4 h-4 ml-2 transition-transform duration-200 ${genderOpen ? "rotate-180" : ""
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

                        {errors.gender && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.gender}
                            </p>
                        )}

                        {genderOpen && (
                            <div className="absolute mt-1 w-full bg-[#4B0503]/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg overflow-hidden z-50">
                                <ul className="text-[#4B0503]">
                                    <li
                                        className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer transition"
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, gender: "M" }));
                                            setErrors(prev => ({ ...prev, gender: "" }));
                                            setGenderOpen(false);
                                        }}
                                    >
                                        Nam
                                    </li>
                                    <li
                                        className="px-4 py-3 hover:bg-[#F7DFA8]/40 cursor-pointer transition"
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, gender: "F" }));
                                            setErrors(prev => ({ ...prev, gender: "" }));
                                            setGenderOpen(false);
                                        }}
                                    >
                                        Nữ
                                    </li>
                                </ul>
                            </div>
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
                        className="px-4 py-2 rounded-md text-white cursor-pointer font-medium"
                        style={{ background: "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)" }}
                    >
                        Tạo tài khoản
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateStudentAccountModal;