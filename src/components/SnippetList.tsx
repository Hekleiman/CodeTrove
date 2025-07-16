// src/components/SnippetList.tsx

import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  fetchSnippets,
  selectSnippetsStatus,
  selectSnippetsError,
} from '../features/snippets/snippetSlice'
import type { AppDispatch, RootState } from '../app/store'
import SnippetCard from './SnippetCard'
import { selectFilteredSnippets } from '../features/snippets/snippetSelectors'

interface SnippetListProps {
  searchTerm?: string
}

const SnippetList: React.FC<SnippetListProps> = ({ searchTerm = '' }) => {
  const dispatch = useDispatch<AppDispatch>()

  // 1) Hooks must all run unconditionally at the top:
  const status   = useSelector(selectSnippetsStatus)
  const error    = useSelector(selectSnippetsError)
  const snippets = useSelector((state: RootState) =>
    selectFilteredSnippets(state, searchTerm)
  )

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchSnippets())
    }
  }, [status, dispatch])

  // 2) Then your early returns based on that state:
  if (status === 'loading') {
    return <p>Loading snippets…</p>
  }
  if (status === 'failed') {
    return <p className="text-red-500">Error: {error}</p>
  }
  if (snippets.length === 0) {
    return (
      <p className="text-center italic text-gray-300">
        No snippets match.
      </p>
    )
  }

  // 3) Finally, render your list
  return (
    <div>
      {snippets.map((s) => (
        <SnippetCard key={s._id} snippet={s} />
      ))}
    </div>
  )
}

export default SnippetList
