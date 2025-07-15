// server/server.js

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { MongoClient, ObjectId } = require('mongodb')

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
