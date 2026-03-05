// import React, { useState, useEffect } from "react";

// const CreateClubAccountModal = ({ isOpen, onClose, onSubmit }) => {
//     const [formData, setFormData] = useState({
//         email: "",           // Chỉ 1 email duy nhất
//         club_name: "",
//         president_name: "",  // Tùy chọn
//     });

//     useEffect(() => {
//         if (!isOpen) {
//             setFormData({
//                 email: "",
//                 club_name: "",
//                 president_name: "",
//             });
//         }
//     }, [isOpen]);

//     if (!isOpen) return null;

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));
//     };

//     const handleSubmit = () => {
//         const submitData = {
//             email: formData.email.trim(),
//             role: "club",
//             club_info: {
//                 club_name: formData.club_name.trim(),
//                 president_name: formData.president_name.trim() || undefined,
//             },
//         };

//         onSubmit(submitData);
//         onClose();
//     };

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
//             <div className="absolute inset-0 bg-black/40" />
//             <div className="relative z-10 w-[420px] rounded-xl bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
//                 <div className="flex justify-between items-center mb-4">
//                     <h3 className="text-lg font-bold text-[#4B0503]">Tạo tài khoản Câu lạc bộ</h3>
//                     <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl font-bold">×</button>
//                 </div>

//                 <div className="space-y-4">
//                     <div>
//                         <label className="block text-sm mb-1 text-[#4B0503]">
//                             Email của câu lạc bộ (@vanlanguni.vn)
//                         </label>
//                         <input
//                             name="email"
//                             value={formData.email}
//                             onChange={handleChange}
//                             type="email"
//                             placeholder="clbtinhoc@vanlanguni.vn"
//                             className="w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001]"
//                         />
//                         <p className="text-xs text-gray-500 mt-1">
//                             Dùng để đăng nhập và liên lạc
//                         </p>
//                     </div>

//                     <div>
//                         <label className="block text-sm mb-1 text-[#4B0503]">
//                             Tên Câu lạc bộ
//                         </label>
//                         <input
//                             name="club_name"
//                             value={formData.club_name}
//                             onChange={handleChange}
//                             placeholder="CLB Tin học"
//                             className="w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001]"
//                         />
//                     </div>

//                     <div>
//                         <label className="block text-sm mb-1 text-[#4B0503]">
//                             Chủ tịch CLB (tùy chọn)
//                         </label>
//                         <input
//                             name="president_name"
//                             value={formData.president_name}
//                             onChange={handleChange}
//                             placeholder="Nguyễn Văn A"
//                             className="w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001]"
//                         />
//                     </div>
//                 </div>

//                 <div className="flex justify-end gap-3 mt-6">
//                     <button onClick={onClose} className="px-4 py-2 rounded-md border text-gray-600 hover:bg-gray-100">
//                         Hủy
//                     </button>
//                     <button
//                         onClick={handleSubmit}
//                         className="px-4 py-2 rounded-md text-white font-medium"
//                         style={{ background: "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)" }}
//                     >
//                         Tạo tài khoản
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CreateClubAccountModal;


import React, { useState, useEffect } from "react";

const CreateClubAccountModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        email: "",
        club_name: "",
        president_name: "",
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                email: "",
                club_name: "",
                president_name: "",
            });
            setErrors({});
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

        if (!formData.email.trim()) {
            newErrors.email = "Vui lòng nhập email";
        } else if (!formData.email.endsWith("@vanlanguni.vn")) {
            newErrors.email = "Email phải có đuôi @vanlanguni.vn";
        }

        if (!formData.club_name.trim()) {
            newErrors.club_name = "Vui lòng nhập tên câu lạc bộ";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        setErrors({});

        if (!validateForm()) return;

        const submitData = {
            email: formData.email.trim(),
            role: "club",
            club_info: {
                club_name: formData.club_name.trim(),
                president_name: formData.president_name.trim() || undefined,
            },
        };

        try {
            await onSubmit(submitData);
            onClose();
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 w-[420px] rounded-xl bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-[#4B0503]">Tạo tài khoản Câu lạc bộ</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl font-bold">×</button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1 text-[#4B0503]">
                            Email của câu lạc bộ (@vanlanguni.vn)
                        </label>
                        <input
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            type="email"
                            placeholder="clbtinhoc@vanlanguni.vn"
                            className={`w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001] ${
                                errors.email ? "border-red-500" : ""
                            }`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.email}
                            </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Dùng để đăng nhập và liên lạc
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-[#4B0503]">
                            Tên Câu lạc bộ
                        </label>
                        <input
                            name="club_name"
                            value={formData.club_name}
                            onChange={handleChange}
                            placeholder="CLB Tin học"
                            className={`w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001] ${
                                errors.club_name ? "border-red-500" : ""
                            }`}
                        />
                        {errors.club_name && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.club_name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-[#4B0503]">
                            Chủ tịch CLB (tùy chọn)
                        </label>
                        <input
                            name="president_name"
                            value={formData.president_name}
                            onChange={handleChange}
                            placeholder="Nguyễn Văn A"
                            className="w-full rounded-md border px-3 py-2 outline-none focus:border-[#B40001]"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-md border text-gray-600 hover:bg-gray-100">
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 rounded-md text-white font-medium"
                        style={{ background: "linear-gradient(90deg, #B40001 0%, #E29A7D 100%)" }}
                    >
                        Tạo tài khoản
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateClubAccountModal;