// src/features/snippets/snippetSelectors.ts

import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import { selectAllSnippets } from './snippetSlice'
import { selectSnippetIdsForCurrentFolder } from '../folders/folderSelectors'

export const selectFilteredSnippets = createSelector(
  [
    selectAllSnippets,
    selectSnippetIdsForCurrentFolder,
    // This “input selector” simply returns the search term passed in
    (_: RootState, searchTerm: string) => searchTerm.toLowerCase().trim(),
  ],
  (allSnippets, folderIds, searchTerm) => {
    // 1) Folder filtering
    const inFolder = folderIds.length > 0
      ? allSnippets.filter(s => folderIds.includes(s._id))
      : allSnippets

    // 2) Search filtering
    if (!searchTerm) {
      return inFolder
    }
    return inFolder.filter(
      s =>
        s.title.toLowerCase().includes(searchTerm) ||
        s.code.toLowerCase().includes(searchTerm)
    )
  }
)
