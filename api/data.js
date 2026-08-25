import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bjpward"

let client
let clientPromise

if (!global._mongoClientPromise) {
  client = new MongoClient(uri)
  global._mongoClientPromise = client.connect()
}
clientPromise = global._mongoClientPromise

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const client = await clientPromise
    const db = client.db('bjpward')
    const collection = db.collection('store')

    if (req.method === 'GET') {
      const doc = await collection.findOne({ _id: 'global_state' })
      if (!doc || !doc.data) {
        return res.status(200).send('{}')
      }
      res.setHeader('Content-Type', 'application/json')
      return res.status(200).send(doc.data)
    }

    if (req.method === 'POST') {
      let dataToSave = req.body;
      if (typeof req.body === 'object') {
        dataToSave = JSON.stringify(req.body)
      } else {
        // If it's sent as text
        dataToSave = req.body.toString()
      }

      await collection.updateOne(
        { _id: 'global_state' },
        { $set: { data: dataToSave } },
        { upsert: true }
      )
      return res.status(200).json({ success: true })
    }
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }

  return res.status(404).end()
}
