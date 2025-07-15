// src/components/SnippetForm.tsx

import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {
  addSnippetAsync,
  updateSnippetAsync,
} from '../features/snippets/snippetSlice'    // ← only thunks here
import type { Snippet } from '../features/snippets/snippetSlice'
import type { AppDispatch } from '../app/store'
import CodeEditor from './CodeEditor'

interface SnippetFormProps {
  existing?: Snippet
  onClose: () => void
}

const SnippetForm: React.FC<SnippetFormProps> = ({ existing, onClose }) => {
  const dispatch = useDispatch<AppDispatch>()
  const [title, setTitle] = useState(existing?.title ?? '')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [language, setLanguage] = useState(existing?.language ?? '')
  const [code, setCode] = useState(existing?.code ?? '')

  useEffect(() => {
    if (existing === undefined) {
      setTitle('')
      setDescription('')
      setLanguage('')
      setCode('')
    }
  }, [existing])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (existing && existing._id) {
      dispatch(
        updateSnippetAsync({
          _id: existing._id,
          title,
          description,
          language,
          code,
        })
      )
    } else {
      dispatch(
        addSnippetAsync({
          title,
          description,
          language,
          code,
        })
      )
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="
          bg-blue-800 text-white p-6 rounded-2xl shadow-2xl
          w-full max-w-lg space-y-6
        "
      >
        <h2 className="text-2xl font-bold">
          {existing ? 'Edit Snippet' : 'New Snippet'}
        </h2>

        <label className="block">
          <span className="text-sm font-medium text-blue-200">Title</span>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="
              mt-1 block w-full bg-blue-700 border border-blue-600
              rounded-lg p-2 text-white placeholder-blue-300
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-blue-200">Description</span>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="
              mt-1 block w-full bg-blue-700 border border-blue-600
              rounded-lg p-2 text-white placeholder-blue-300
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
            rows={3}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-blue-200">Language</span>
          <input
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="
              mt-1 block w-full bg-blue-700 border border-blue-600
              rounded-lg p-2 text-white placeholder-blue-300
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-blue-200">Code</span>
          <div className="mt-1 bg-blue-700 border border-blue-600 rounded-lg overflow-hidden">
            <CodeEditor value={code} onChange={setCode} />
          </div>
        </label>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="
              px-4 py-2 bg-blue-700 border border-blue-600
              text-white rounded-lg hover:bg-blue-600
            "
          >
            Cancel
          </button>
          <button
            type="submit"
            className="
              px-4 py-2 bg-[#8B5E3C] text-yellow-300
              rounded-lg hover:bg-[#705135]
            "
          >
            {existing ? 'Save' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SnippetForm
