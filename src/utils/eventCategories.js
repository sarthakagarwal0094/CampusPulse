const CATEGORY_PALETTE = {
  technical: { className: "category-technical", label: "Technical", foreground: "#1d4ed8", background: "#dbeafe" },
  cultural: { className: "category-cultural", label: "Cultural", foreground: "#6d28d9", background: "#ede9fe" },
  sports: { className: "category-sports", label: "Sports", foreground: "#15803d", background: "#dcfce7" },
  arts: { className: "category-arts", label: "Arts", foreground: "#c2410c", background: "#ffedd5" },
  workshop: { className: "category-workshop", label: "Workshop", foreground: "#0f766e", background: "#ccfbf1" },
};

export function normalizeEventCategory(category) {
  const normalized = String(category || "").trim().toLowerCase().replace(/[\s_-]+/g, "");
  if (["workshop", "workshops"].includes(normalized)) return "workshop";
  return normalized;
}

export function getEventCategoryStyle(category) {
  return CATEGORY_PALETTE[normalizeEventCategory(category)] || {
    className: "category-other",
    label: String(category || "Other"),
    foreground: "#475569",
    background: "#e2e8f0",
  };
}

export const categoryClass = (category) => getEventCategoryStyle(category).className;
