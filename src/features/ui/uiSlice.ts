// src/features/ui/uiSlice.ts

import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  selectedFolder: string
}

const initialState: UIState = {
  selectedFolder: 'all',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    selectFolder(state, action: PayloadAction<string>) {
      state.selectedFolder = action.payload
    },
  },
})

export const { selectFolder } = uiSlice.actions
export default uiSlice.reducer
