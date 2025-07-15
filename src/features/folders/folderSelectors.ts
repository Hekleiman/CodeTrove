// src/features/folders/folderSelectors.ts

import { createSelector } from '@reduxjs/toolkit'
import type { RootState }   from '../../app/store'
import { selectAllSnippets } from '../snippets/snippetSlice'

// Base selectors
const selectFoldersItems    = (state: RootState) => state.folders?.items
const selectCurrentFolderId = (state: RootState) => state.ui.selectedFolder
const selectAllSnippetsState = (state: RootState) => selectAllSnippets(state)

// Memoized selector for snippet IDs of the current folder
export const selectSnippetIdsForCurrentFolder = createSelector(
  [selectFoldersItems, selectCurrentFolderId, selectAllSnippetsState],
  (folders, selectedId, allSnippets) => {
    // Make sure we have an array
    const list = Array.isArray(folders) ? folders : []

    // “All” or no selection: return every snippet’s ID
    if (!selectedId || selectedId === 'all') {
      return allSnippets.map((s) => s._id)
    }

    // Find the folder by either its client id or Mongo _id
    const folder = list.find(
      (f) => f.id === selectedId || String(f._id) === selectedId
    )

    // If we seeded with `snippets` or are using `snippetIds`, support both
    const idsFromState = folder?.snippetIds
    const idsFromDB    = (folder as any)?.snippets

    return Array.isArray(idsFromState)
      ? idsFromState
      : Array.isArray(idsFromDB)
      ? idsFromDB.map(String)
      : []
  }
)
