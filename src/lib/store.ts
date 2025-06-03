import { configureStore } from "@reduxjs/toolkit";
import pageReducer from "./store/page";
import dirReducer from "./store/pageTree"
import metadataReducer from "./store/metadata"

import { PageMiddleware } from "./middleware/page";
import { useDispatch, useSelector } from "react-redux";
import { listenerMiddleware } from "@/lib/middleware/listener";

export const store = configureStore({
  reducer: {
    page: pageReducer,
    dir: dirReducer,
    metadata: metadataReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().prepend(PageMiddleware).prepend(listenerMiddleware.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();




// StorageMiddleware
