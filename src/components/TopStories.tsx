import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTopStories } from '../features/news/newsSlice'
import type { RootState, AppDispatch } from '../app/store'

const TopStories: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { stories, status, error } = useSelector(
    (state: RootState) => state.news
  )

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTopStories())
    }
  }, [status, dispatch])

  if (status === 'loading') {
    return <p>Loading top stories…</p>
  }
  if (status === 'failed') {
    return <p className="text-red-500">Error: {error}</p>
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2 pirate-font">Top News Stories</h2>
      <ul className="space-y-4">
        {stories.map((story) => (
          <li key={story.objectID} className="border-l-4 border-wood-light pl-3">
            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-200 font-semibold hover:underline"
            >
              {story.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TopStories
