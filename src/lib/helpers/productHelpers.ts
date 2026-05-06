export const getStatus = (qty: number) => {
  if (qty < 15) return { label: "Low Stock", class: "status-low" };
  if (qty <= 30) return { label: "Medium", class: "status-med" };
  return { label: "In Stock", class: "status-high" };
};
