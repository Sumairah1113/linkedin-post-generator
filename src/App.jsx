import { useState } from 'react'
import './App.css'

function App() {
  const [posts, setPosts] = useState([])
  const [trends, setTrends] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    setLoading(true)
    setError('')
    setPosts([])
    setTrends('')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPosts(data.posts)
      setTrends(data.trends)
    } catch (err) {
      setError('Something went wrong. Check your API key and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="header">
        <h1>LinkedIn Post Generator</h1>
        <p className="subtitle">AI Tooling & Workflows · Built for the top 1%</p>
        <button onClick={generate} disabled={loading} className="generate-btn">
          {loading ? 'Generating...' : 'Generate Posts'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {trends && (
        <div className="trends-box">
          <h3>📡 Trend Brief (from Hacker News)</h3>
          <pre>{trends}</pre>
        </div>
      )}

      {posts.length > 0 && (
        <div className="posts">
          {posts.map((post, i) => (
            <div key={i} className="post-card">
              <div className="post-number">Post {i + 1}</div>
              <p className="post-text">{post}</p>
              <button
                className="copy-btn"
                onClick={() => navigator.clipboard.writeText(post)}
              >
                Copy
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && !error && (
        <div className="empty-state">
          Click Generate to pull live AI trends and create 3 LinkedIn posts.
        </div>
      )}
    </div>
  )
}

export default App
