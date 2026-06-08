import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const STORAGE_KEY = "favouriteIds";

function loadFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

const favouritesSlice = createSlice({
  name: "favourites",
  initialState: { ids: [] as string[] },
  reducers: {
    initFavourites(state) {
      state.ids = loadFromStorage();
    },
    toggleFavourite(state, action: PayloadAction<string>) {
      const id = action.payload;
      const idx = state.ids.indexOf(id);
      if (idx === -1) {
        state.ids.push(id);
      } else {
        state.ids.splice(idx, 1);
      }
      saveToStorage(state.ids);
    },
  },
});

export const { initFavourites, toggleFavourite } = favouritesSlice.actions;
export default favouritesSlice.reducer;

export const selectFavouriteIds = (state: { favourites: { ids: string[] } }) =>
  state.favourites.ids;
export const selectIsFavourite = (id: string) => (state: { favourites: { ids: string[] } }) =>
  state.favourites.ids.includes(id);
