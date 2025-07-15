// src/features/folders/folderSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import { nanoid } from 'nanoid'

export interface Folder {
  _id: string       // Mongo’s ID (when loaded from server)
  id: string        // our app’s own ID (for new folders before server responds)
  name: string
  snippetIds: string[]
}

// Async thunks for persistence
export const fetchFolders = createAsyncThunk<Folder[]>(
  'folders/fetchAll',
  async () => {
    const res = await fetch('/api/folders')
    if (!res.ok) throw new Error('Failed to fetch folders')
    return (await res.json()) as Folder[]
  }
)

export const addFolderAsync = createAsyncThunk<Folder, string>(
  'folders/add',
  async (name) => {
    const newFolder = { id: nanoid(), name, snippetIds: [] }
    const res = await fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFolder),
    })
    if (!res.ok) throw new Error('Failed to add folder')
    return (await res.json()) as Folder
  }
)

export const updateFolderAsync = createAsyncThunk<Folder, Partial<Folder> & {_id:string}>(
  'folders/update',
  async (folder) => {
    const { _id, ...updates } = folder
    const res = await fetch(`/api/folders/${_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) throw new Error('Failed to update folder')
    return (await res.json()) as Folder
  }
)

export const deleteFolderAsync = createAsyncThunk<string, string>(
  'folders/delete',
  async (id) => {
    const res = await fetch(`/api/folders/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete folder')
    return id
  }
)

// Payload for our toggle reducer
interface TogglePayload {
  folderId: string
  snippetId: string
}

interface FoldersState {
  items: Folder[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: FoldersState = {
  items: [],
  status: 'idle',
  error: null,
}

const folderSlice = createSlice({
  name: 'folders',
  initialState,
  reducers: {
    // Toggling snippet inclusion in a folder (client-only)
    toggleSnippetInFolder(state, action: PayloadAction<TogglePayload>) {
      const { folderId, snippetId } = action.payload
      const folder = state.items.find(f => f.id === folderId || f._id === folderId)
      if (!folder) return
      const idx = folder.snippetIds.indexOf(snippetId)
      if (idx >= 0) folder.snippetIds.splice(idx, 1)
      else folder.snippetIds.push(snippetId)
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchFolders.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchFolders.fulfilled, (state, { payload }) => {
        state.status = 'succeeded'
        state.items = payload
      })
      .addCase(fetchFolders.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? null
      })

      // ADD
      .addCase(addFolderAsync.fulfilled, (state, { payload }) => {
        state.items.push(payload)
      })

      // UPDATE
      .addCase(updateFolderAsync.fulfilled, (state, { payload }) => {
  const idx = state.items.findIndex(f => f._id === payload._id);
  if (idx !== -1) {
    // update only snippetIds, keep name/id intact
    state.items[idx] = {
      ...state.items[idx],
      snippetIds: payload.snippetIds,
    };
  }
})

      // DELETE
      .addCase(deleteFolderAsync.fulfilled, (state, { payload }) => {
        state.items = state.items.filter(f => f._id !== payload)
      })
  },
})

export const { toggleSnippetInFolder } = folderSlice.actions
export default folderSlice.reducer

// Selector
export const selectAllFolders = (state: RootState) => state.folders.items
