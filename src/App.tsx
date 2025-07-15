// src/App.tsx

import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from './app/store'
import type { Snippet } from './features/snippets/snippetSlice'

import FloatingStories from './components/FloatingStories'
import FolderList      from './components/FolderList'
import SnippetList     from './components/SnippetList'
import SnippetForm     from './components/SnippetForm'

import { fetchFolders }                     from './features/folders/folderSlice'
import { fetchSnippets }                    from './features/snippets/snippetSlice'
import { selectFolder }                     from './features/ui/uiSlice'
import { selectSnippetIdsForCurrentFolder } from './features/folders/folderSelectors'

function App() {
  const dispatch = useDispatch<AppDispatch>()
  const [storiesMin,  setStoriesMin]  = useState(false)
  const [foldersMin,  setFoldersMin]  = useState(false)
  const [formSnippet, setFormSnippet] = useState<Snippet | null | undefined>()
  const [searchTerm,  setSearchTerm]  = useState('')

  useEffect(() => {
    dispatch(fetchFolders())
    dispatch(fetchSnippets())
  }, [dispatch])

  const selectedFolder = useSelector((s: RootState) => s.ui.selectedFolder)
  const snippetIds     = useSelector(selectSnippetIdsForCurrentFolder)

  // Container gets side padding and top padding to clear the fixed logo
  const containerClasses = [
    'relative bg-blue-900 text-white min-h-screen pt-32 px-4 lg:px-6',
    !storiesMin && 'lg:pr-72',
    !foldersMin && 'lg:pl-64',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={containerClasses}>
      {/* Side panels */}
      <FloatingStories
        minimized={storiesMin}
        toggle={() => setStoriesMin(v => !v)}
      />
      <FolderList
        minimized={foldersMin}
        toggle={() => setFoldersMin(v => !v)}
        selectedId={selectedFolder}
        onSelect={(id) => dispatch(selectFolder(id))}
      />

      {/* Fixed logo & chest icon */}

      <div
        onClick={() => window.location.href = '/'}
        role="button"
        tabIndex={0}
        className="fixed top-6 left-6 flex items-center space-x-2 z-30 cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
        onKeyPress={e => { if (e.key === 'Enter') window.location.href = '/' }}
        aria-label="Go home"
      >
        <img src="/logo.png"       alt="CodeTrove" className="h-16" />
        <img src="/chest-icon.png" alt="Chest"     className="h-10" />
      </div>


      {/* Search + New Snippet row */}
      <div className="relative z-20 mb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search snippets…"
            className="flex-1 px-4 py-2 rounded bg-blue-700 text-white placeholder-blue-300
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setFormSnippet(null)}
            className="flex items-center space-x-2 px-6 py-2 bg-[#8B5E3C] text-yellow-300
                       rounded-lg font-medium hover:bg-[#705135]"
          >
            <span className="text-2xl leading-none">+</span>
            <span>New Snippet</span>
          </button>
        </div>
      </div>

      {/* Snippet form modal */}
      {formSnippet !== undefined && (
        <SnippetForm
          existing={formSnippet}
          onClose={() => setFormSnippet(undefined)}
        />
      )}

      {/* Main content */}
      <main className="p-6">
        <SnippetList
          onEdit={setFormSnippet}
          filterIds={snippetIds}
          searchTerm={searchTerm}
        />
      </main>
    </div>
  )
}

export default App
