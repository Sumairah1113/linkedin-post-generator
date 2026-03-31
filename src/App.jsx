import { useState } from 'react'
import './App.css'

function App() {
  const [posts, setPosts] = useState([])
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(null)

  const generate = async () => {
    setLoading(true)
    setError('')
    setPosts([])
    setTrends([])

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPosts(data.posts)
      setTrends(data.trends.split('\n').filter(Boolean))
    } catch (err) {
      setError('Something went wrong. Check your API key and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (post, index) => {
    navigator.clipboard.writeText(post)
    setCopied(index)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-logo">
          <div className="nav-logo-dot" />
          <span className="nav-logo-text">PostForge</span>
        </div>
        <span className="nav-badge">AI · LinkedIn</span>
      </nav>

      <div className="hero">
        <div className="hero-tag">
          <span className="hero-tag-dot" />
          Powered by live Hacker News trends
        </div>
        <h1>LinkedIn posts that<br /><span>actually perform</span></h1>
        <p>Generate high-signal, practitioner-grade posts for the AI tooling & workflows space. No fluff. No filler.</p>
        <button onClick={generate} disabled={loading} className="generate-btn">
          <span className="btn-icon">⚡</span>
          {loading ? 'Generating...' : 'Generate Posts'}
        </button>

        <div className="stats-row">
          <div className="stat">
            <div className="stat-number">3</div>
            <div className="stat-label">Posts per batch</div>
          </div>
          <div className="stat">
            <div className="stat-number">Live</div>
            <div className="stat-label">Trend data</div>
          </div>
          <div className="stat">
            <div className="stat-number">Top 1%</div>
            <div className="stat-label">Quality target</div>
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Pulling trends & crafting posts...</p>
        </div>
      )}

      {trends.length > 0 && (
        <div className="trends-section">
          <div className="section-label">📡 Trend Brief — Hacker News</div>
          <div className="trends-box">
            {trends.map((t, i) => (
              <span key={i} className="trend-pill">{t.replace(/^-\s*/, '')}</span>
            ))}
          </div>
        </div>
      )}

      {posts.length > 0 && (
        <div className="posts-section">
          <div className="section-label">✦ Generated Posts</div>
          {posts.map((post, i) => (
            <div key={i} className="post-card">
              <div className="post-card-header">
                <span className="post-number-badge">Post {i + 1}</span>
                <button
                  className={`copy-btn ${copied === i ? 'copied' : ''}`}
                  onClick={() => handleCopy(post, i)}
                >
                  {copied === i ? '✓ Copied' : '⎘ Copy'}
                </button>
              </div>
              <p className="post-text">{post}</p>
              <div className="post-divider" />
              <div className="post-footer">
                <span className="post-tag">AI Tooling</span>
                <span className="post-tag">Developer Workflows</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-icon">✦</div>
          <h3>Ready to generate</h3>
          <p>Hit Generate to pull live AI trends and craft 3 LinkedIn posts.</p>
        </div>
      )}
    </div>
  )
}

export default App
