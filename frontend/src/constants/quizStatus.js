export const QUIZ_STATUS = {
    draft: {
        value: "draft",
        label: "Bản nháp",
        color: "linear-gradient(90deg, #F7DFA8 0%,  #D12B1E 100%)"
    },
    published: {
        value: "published",
        label: "Đã xuất bản",
        color: "linear-gradient(90deg, #5B0704 0%, #A71D0D 100%)",
    },
};

export const QUIZ_STATUS_OPTIONS = Object.values(QUIZ_STATUS).map(s => ({
    label: s.label,
    value: s.value,
}));
