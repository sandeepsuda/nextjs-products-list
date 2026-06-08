import { configureStore } from "@reduxjs/toolkit";
import favouritesReducer from "./favouritesSlice";
import cartReducer from "./cartSlice";

export const store = configureStore({
  reducer: {
    favourites: favouritesReducer,
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
