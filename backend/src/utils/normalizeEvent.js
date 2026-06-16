export const normalizeEvent = (event) => {
  const parseDate = (value) => {
    if (!value) return null;

    if (value instanceof Date) return value;

    if (typeof value === "string" && value.includes("/")) {
      const [d, m, y] = value.split("/");
      return new Date(`${y}-${m}-${d}`);
    }

    const d = new Date(value);
    return isNaN(d) ? null : d;
  };

  const normalizePrice = (price) => {
    if (price === null || price === undefined) return 0;
    if (typeof price === "number") return price;

    if (typeof price === "string") {
      if (price.toLowerCase().includes("miễn")) return 0;
      return Number(price.replace(/[^\d]/g, "")) || 0;
    }

    return 0;
  };

  const price = normalizePrice(event.price);

  return {
    ...event,
    title: event.title || event.name || "Chưa có tên",
    club: event.club || event.createdBy || null,
    _normalized: {
      date: parseDate(event.date),
      promotionStartDate: parseDate(event.promotionStartDate),
      promotionEndDate: parseDate(event.promotionEndDate),

      isPaid: price > 0,
      price,
    },
  };
};
