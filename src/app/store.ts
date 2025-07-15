// src/app/store.ts

import { configureStore } from '@reduxjs/toolkit'
import snippetReducer from '../features/snippets/snippetSlice'
import folderReducer from '../features/folders/folderSlice'
import uiReducer from '../features/ui/uiSlice'
import newsReducer from '../features/news/newsSlice'   // ← import the news slice

export const store = configureStore({
  reducer: {
    snippets: snippetReducer,
    folders:  folderReducer,
    ui:       uiReducer,
    news:     newsReducer,   // ← register it here
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
