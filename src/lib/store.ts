import { configureStore } from "@reduxjs/toolkit";
import pageReducer from "./store/page";
import dirReducer from "./store/pageTree"

import { useDispatch, useSelector } from "react-redux";
import { listenerMiddleware } from "@/lib/middleware/listener";

export const store = configureStore({
  reducer: {
    page: pageReducer,
    dir: dirReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().prepend(listenerMiddleware.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();




// StorageMiddleware
