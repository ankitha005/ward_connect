import http from 'http'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DB_FILE = path.join(__dirname, 'db.json')

const server = http.createServer(async (req, res) => {
  // Setup CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  if (req.url === '/data' && req.method === 'GET') {
    try {
      const data = await fs.readFile(DB_FILE, 'utf-8')
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(data)
    } catch (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end('{}') // Empty if no file yet
      } else {
        res.writeHead(500)
        res.end(JSON.stringify({ error: 'Failed to read db.json' }))
      }
    }
    return
  }

  if (req.url === '/data' && req.method === 'POST') {
    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })
    req.on('end', async () => {
      try {
        await fs.writeFile(DB_FILE, body)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: true }))
      } catch (err) {
        res.writeHead(500)
        res.end(JSON.stringify({ error: err.message }))
      }
    })
    return
  }

  if (req.url === '/verify-voter' && req.method === 'POST') {
    let body = ''
    req.on('data', chunk => body += chunk.toString())
    req.on('end', async () => {
      try {
        const { epic_number } = JSON.parse(body)

        const response = await fetch('https://api.attestr.com/api/v1/public/checkx/epic', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // REPLACE WITH YOUR ATTESTR AUTH TOKEN (from Register App)
            'Authorization': 'Basic YOUR_ATTESTR_AUTH_TOKEN'
          },
          body: JSON.stringify({ epic: epic_number })
        })

        const data = await response.json()
        res.writeHead(response.status, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(data))
      } catch (err) {
        res.writeHead(500)
        res.end(JSON.stringify({ error: err.message }))
      }
    })
    return
  }

  res.writeHead(404)
  res.end()
})

const PORT = 4000
server.listen(PORT, () => {
  console.log(`JSON Persistence Server running on http://localhost:${PORT}`)
  console.log(`Data will be saved to ${DB_FILE}`)
})
