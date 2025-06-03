import { createListenerMiddleware, addListener, type ListenerMiddleware, type Middleware } from '@reduxjs/toolkit'
import type { RootState, AppDispatch } from '@/lib/store'
import { setpage } from '../store/page'

export const PageMiddleware: Middleware = store => next => action =>  {
  return next(action);
}
