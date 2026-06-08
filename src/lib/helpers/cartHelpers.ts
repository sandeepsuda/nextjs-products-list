export const TAX_RATE = 0.1;

export function formatCurrency(value: number) {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function calculateTax(subtotal: number) {
  return subtotal * TAX_RATE;
}

export function calculateTotal(subtotal: number) {
  return subtotal + calculateTax(subtotal);
}

