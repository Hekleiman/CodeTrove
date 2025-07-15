// src/components/FloatingStories.tsx

import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTopStories } from '../features/news/newsSlice'
import type { RootState, AppDispatch } from '../app/store'

interface FloatingStoriesProps {
  minimized: boolean
  toggle: () => void
}

const FloatingStories: React.FC<FloatingStoriesProps> = ({ minimized, toggle }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { stories, status, error } = useSelector((s: RootState) => s.news)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTopStories())
    }
  }, [status, dispatch])

  if (minimized) {
    return (
      <div
        className="
          fixed top-20 right-4
          w-4 h-16
          bg-wood-dark
          rounded-l-md
          shadow-lg
          z-50
          cursor-pointer
        "
        onClick={toggle}
        title="Show Top Stories"
      />
    )
  }

  return (
    <div
      className="
        fixed top-20 right-4
        w-64 max-h-[70vh]
        overflow-y-auto
        bg-wood-dark/90    /* semi-opaque */
        border border-wood-light
        p-4 rounded-lg shadow-lg
        z-50 text-white
      "
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold pirate-font">Top Stories</h3>
        <button
          onClick={toggle}
          className="text-sm px-2 py-1 border border-wood-light rounded hover:bg-wood-light/30"
        >
          −
        </button>
      </div>

      {status === 'loading' && <p className="text-sm">Loading…</p>}
      {status === 'failed' && <p className="text-sm text-red-300">Error: {error}</p>}

      <ul className="space-y-1 text-sm">
        {stories.map(story => (
          <li key={story.objectID}>
            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate hover:underline"
            >
              {story.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default FloatingStories
