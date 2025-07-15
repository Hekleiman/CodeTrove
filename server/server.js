// server/server.js

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { MongoClient, ObjectId } = require('mongodb')
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (_req, res) => {
  res.send('🗡️ CodeTrove API is alive!')
})

async function startServer() {
  try {
    const client = new MongoClient(process.env.MONGO_URI)
    await client.connect()
    const db = client.db('codeTrove')
    const snippets = db.collection('snippets')

    // GET all snippets
    app.get('/api/snippets', async (_req, res) => {
      const all = await snippets.find().toArray()
      res.json(all)
    })

    // POST a new snippet
    app.post('/api/snippets', async (req, res) => {
      const doc = req.body
      const result = await snippets.insertOne(doc)
      res.status(201).json({ ...doc, _id: result.insertedId })
    })

    // PUT update
    app.put('/api/snippets/:id', async (req, res) => {
      const { id } = req.params
      const updates = req.body
      await snippets.updateOne(
        { _id: new ObjectId(id) },
        { $set: updates }
      )
      res.json({ ...updates, _id: id })
    })

    // DELETE
    app.delete('/api/snippets/:id', async (req, res) => {
      const { id } = req.params
      await snippets.deleteOne({ _id: new ObjectId(id) })
      res.sendStatus(204)
    })

    // AI alternatives route
    app.post('/api/alternatives', async (req, res) => {
      const { code, language } = req.body || {}
      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) {
        return res.status(500).json({ error: 'OPENAI_API_KEY not set' })
      }

      const prompt =
        `You are a seasoned developer. Given the following code snippet in ${language || 'the provided language'}, provide three alternative implementations ordered from most efficient to least. ` +
        `Also rate the original snippet's efficiency from 1 to 10. ` +
        `Respond strictly in JSON with the shape {"rating":number,"alternatives":[{"rank":1,"code":"..."},...]}`

      try {
        const aiRes = await fetch(OPENAI_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            temperature: 0.2,
            messages: [
              { role: 'system', content: 'You generate code alternatives.' },
              { role: 'user', content: prompt },
              { role: 'user', content: code },
            ],
          }),
        })
        const data = await aiRes.json()
        const text = data.choices?.[0]?.message?.content
        let parsed
        try {
          parsed = JSON.parse(text)
        } catch (err) {
          return res.status(500).json({ error: 'AI response parse failed', raw: text })
        }
        res.json(parsed)
      } catch (err) {
        console.error('AI request failed:', err)
        res.status(500).json({ error: 'AI request failed' })
      }
    })

const folders = db.collection('folders')

// GET all folders
app.get('/api/folders', async (_req, res) => {
  const all = await folders.find().toArray()
  res.json(all)
})

// POST new folder
app.post('/api/folders', async (req, res) => {
  const doc = req.body
  const result = await folders.insertOne(doc)
  res.status(201).json({ ...doc, _id: result.insertedId })
})

// PUT update folder (e.g. snippetIds)
app.put('/api/folders/:id', async (req, res) => {
  const { id } = req.params
  const updates = req.body   // { name?:string, snippetIds?:string[] }
  await folders.updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  )
  res.json({ _id: id, ...updates })
})

// DELETE a folder
app.delete('/api/folders/:id', async (req, res) => {
  const { id } = req.params
  await folders.deleteOne({ _id: new ObjectId(id) })
  res.sendStatus(204)
})

    const port = process.env.PORT || 5001
    app.listen(port, () => {
      console.log(`API listening on http://localhost:${port}`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

startServer()
