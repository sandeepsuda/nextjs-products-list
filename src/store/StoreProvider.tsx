"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { initFavourites } from "@/store/favouritesSlice";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useRef(false);

  useEffect(() => {
    if (!hydrated.current) {
      store.dispatch(initFavourites());
      hydrated.current = true;
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
