import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export interface Story {  
  objectID: string  
  title: string  
  url: string  
}

interface NewsState {  
  stories: Story[]  
  status: 'idle' | 'loading' | 'succeeded' | 'failed'  
  error: string | null  
}

const initialState: NewsState = { stories: [], status: 'idle', error: null }

export const fetchTopStories = createAsyncThunk(
  'news/fetchTopStories',
  async () => {
    const response = await axios.get(
      'https://hn.algolia.com/api/v1/search',
      { params: { tags: 'front_page' } }
    )
    // Return the first 3 hits
    return response.data.hits.slice(0,3) as Story[]
  }
)

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchTopStories.pending, state => {
        state.status = 'loading'; state.error = null
      })
      .addCase(fetchTopStories.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.stories = action.payload
      })
      .addCase(fetchTopStories.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Fetch failed'
      })
  },
})

export default newsSlice.reducer



// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
// import axios from 'axios'

// export interface Story {
//   id: string
//   title: string
//   description: string
//   url: string
// }

// interface NewsState {
//   stories: Story[]
//   status: 'idle' | 'loading' | 'succeeded' | 'failed'
//   error: string | null
// }

// const initialState: NewsState = {
//   stories: [],
//   status: 'idle',
//   error: null,
// }

// // Async thunk to fetch top headlines
// export const fetchTopStories = createAsyncThunk(
//   'news/fetchTopStories',
//   async () => {
//     const apiKey = import.meta.env.VITE_CURRENTS_API_KEY
//     const response = await axios.get(
//       `https://api.currentsapi.services/v1/latest-news`,
//       {
//         params: { apiKey, language: 'en' },
//       }
//     )
//     // Return only the first 3 stories
//     return response.data.news.slice(0, 3) as Story[]
//   }
// )

// const newsSlice = createSlice({
//   name: 'news',
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchTopStories.pending, (state) => {
//         state.status = 'loading'
//         state.error = null
//       })
//       .addCase(fetchTopStories.fulfilled, (state, action) => {
//         state.status = 'succeeded'
//         state.stories = action.payload
//       })
//       .addCase(fetchTopStories.rejected, (state, action) => {
//         state.status = 'failed'
//         state.error = action.error.message || 'Fetch failed'
//       })
//   },
// })

// export default newsSlice.reducer
