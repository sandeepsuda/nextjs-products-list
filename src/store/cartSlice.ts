import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const STORAGE_KEY = "cartItems";

export interface CartItem {
  id: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

function normalizeItems(items: CartItem[]): CartItem[] {
  return items
    .filter((item) => typeof item.id === "string" && Number.isFinite(item.quantity))
    .map((item) => ({ id: item.id, quantity: Math.max(1, Math.floor(item.quantity)) }));
}

function loadFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeItems(JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [] } as CartState,
  reducers: {
    initCart(state) {
      state.items = loadFromStorage();
    },
    addToCart(state, action: PayloadAction<string>) {
      const existing = state.items.find((item) => item.id === action.payload);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ id: action.payload, quantity: 1 });
      }
      saveToStorage(state.items);
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
      saveToStorage(state.items);
    },
    incrementQuantity(state, action: PayloadAction<string>) {
      const item = state.items.find((cartItem) => cartItem.id === action.payload);
      if (item) {
        item.quantity += 1;
        saveToStorage(state.items);
      }
    },
    decrementQuantity(state, action: PayloadAction<string>) {
      const item = state.items.find((cartItem) => cartItem.id === action.payload);
      if (!item) return;
      if (item.quantity <= 1) {
        state.items = state.items.filter((cartItem) => cartItem.id !== action.payload);
      } else {
        item.quantity -= 1;
      }
      saveToStorage(state.items);
    },
    clearCart(state) {
      state.items = [];
      saveToStorage(state.items);
    },
  },
});

export const {
  initCart,
  addToCart,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartItemCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
