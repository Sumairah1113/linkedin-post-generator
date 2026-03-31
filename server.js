import express from 'express'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

dotenv.config({ path: '.env.local' })

const app = express()
app.use(express.json())

app.post('/api/generate', async (req, res) => {
  const { default: handler } = await import('./api/generate.js')
  return handler(req, res)
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`API KEY LOADED: ${process.env.ANTHROPIC_API_KEY ? 'YES' : 'NO'}`)
  console.log(`Server running on http://localhost:${PORT}`)
})