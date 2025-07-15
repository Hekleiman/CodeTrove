// src/components/FolderList.tsx

import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  fetchFolders,
  addFolderAsync,
  updateFolderAsync,
  deleteFolderAsync,
  selectAllFolders,
} from '../features/folders/folderSlice'
import type { AppDispatch } from '../app/store'

interface FolderListProps {
  minimized: boolean
  toggle: () => void
  selectedId: string
  onSelect: (id: string) => void
}

const FolderList: React.FC<FolderListProps> = ({
  minimized,
  toggle,
  selectedId,
  onSelect,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const folders = useSelector(selectAllFolders)
  const [newName, setNewName] = useState('')

  useEffect(() => {
    dispatch(fetchFolders())
  }, [dispatch])

  const handleCreate = () => {
    const name = newName.trim()
    if (!name) return
    dispatch(addFolderAsync(name))
    setNewName('')
  }

  const handleRename = (folderId: string, currentName: string) => {
    const name = window.prompt('New folder name:', currentName)?.trim()
    if (name && name !== currentName) {
      dispatch(updateFolderAsync({ _id: folderId, name }))
    }
  }

  const handleDelete = (folderId: string) => {
    if (window.confirm('Delete this folder?')) {
      dispatch(deleteFolderAsync(folderId))
    }
  }

  if (minimized) {
    return (
      <div
        className="fixed top-20 left-4 w-12 h-12 bg-wood-dark rounded-r-md shadow-lg flex items-center justify-center cursor-pointer z-50"
        onClick={toggle}
        title="Show Folders"
      >
        <img src="/chest-icon.png" alt="Open Folders" className="w-8 h-8" />
      </div>
    )
  }

  return (
    <aside className="fixed top-20 left-0 w-64 h-[calc(100vh-5rem)] bg-wood-dark/90 p-4 overflow-y-auto shadow-lg z-40">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold pirate-font text-yellow-200">Folders</h2>
        <button
          onClick={toggle}
          className="text-yellow-200 text-sm px-2 py-1 border border-wood-light rounded hover:bg-wood-light/30"
        >
          −
        </button>
      </div>

      <ul className="space-y-1">
        {folders.map((f) => (
          <li key={f._id} className="flex items-center">
            <button
              onClick={() => onSelect(f.id || f._id)}
              className={
                'flex-1 flex items-center p-2 rounded ' +
                (f.id === selectedId || f._id === selectedId
                  ? 'bg-wood-dark text-yellow-100'
                  : 'hover:bg-wood-dark/50 text-yellow-100')
              }
            >
              <img src="/chest-icon.png" alt="Folder" className="mr-2 w-6 h-6" />
              {f.name}
            </button>
            <button
              onClick={() => handleRename(f._id, f.name)}
              className="text-sm text-yellow-300 px-2"
              title="Rename"
            >
              ✎
            </button>
            <button
              onClick={() => handleDelete(f._id)}
              className="text-sm text-red-400 px-2"
              title="Delete"
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New Folder"
          className="flex-1 bg-wood-light text-wood-dark placeholder-wood-dark/70 border border-wood-dark rounded-l p-1"
        />
        <button
          onClick={handleCreate}
          className="px-3 bg-wood text-yellow-300 rounded-r hover:bg-wood-dark"
        >
          +
        </button>
      </div>
    </aside>
  )
}

export default FolderList
