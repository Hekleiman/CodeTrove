// src/features/snippets/snippetSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

export interface Snippet {
  _id: string       // matches Mongo’s ObjectId
  title: string
  description: string
  language: string
  code: string
}

// Thunks to call your Express API
export const fetchSnippets = createAsyncThunk<Snippet[]>(
  'snippets/fetchAll',
  async () => {
    const res = await fetch('/api/snippets')
    if (!res.ok) throw new Error('Failed to fetch snippets')
    return (await res.json()) as Snippet[]
  }
)

export const addSnippetAsync = createAsyncThunk<Snippet, Omit<Snippet,'_id'>>(
  'snippets/add',
  async (newSnippet) => {
    const res = await fetch('/api/snippets', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(newSnippet),
    })
    if (!res.ok) throw new Error('Failed to add snippet')
    return (await res.json()) as Snippet
  }
)

export const updateSnippetAsync = createAsyncThunk<Snippet, Snippet>(
  'snippets/update',
  async (snippet) => {
    // pull out _id, leave only the fields we want to set
    const { _id, ...updates } = snippet

    const res = await fetch(`/api/snippets/${_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),   // <-- send only title, description, language, code
    })
    if (!res.ok) throw new Error('Failed to update snippet')

    // server responds { …updates, _id }
    return (await res.json()) as Snippet
  }
)


export const deleteSnippetAsync = createAsyncThunk<string, string>(
  'snippets/delete',
  async (id) => {
    const res = await fetch(`/api/snippets/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete snippet')
    return id
  }
)

interface SnippetsState {
  items: Snippet[]
  status: 'idle'|'loading'|'succeeded'|'failed'
  error: string | null
}

const initialState: SnippetsState = {
  items: [],
  status: 'idle',
  error: null,
}

const snippetSlice = createSlice({
  name: 'snippets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // FETCH ALL
    builder
      .addCase(fetchSnippets.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchSnippets.fulfilled, (state, { payload }) => {
        state.status = 'succeeded'
        state.items = payload
      })
      .addCase(fetchSnippets.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Fetch failed'
      })

    // ADD
    builder
      .addCase(addSnippetAsync.fulfilled, (state, { payload }) => {
        state.items.push(payload)
      })

    // UPDATE
    builder
      .addCase(updateSnippetAsync.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex(s => s._id === payload._id)
        if (idx !== -1) state.items[idx] = payload
      })

    // DELETE
    builder
      .addCase(deleteSnippetAsync.fulfilled, (state, { payload }) => {
        state.items = state.items.filter(s => s._id !== payload)
      })
  },
})

export default snippetSlice.reducer

// Selector
export const selectAllSnippets = (state: RootState) => state.snippets.items
export const selectSnippetsStatus = (state: RootState) => state.snippets.status
export const selectSnippetsError = (state: RootState) => state.snippets.error
