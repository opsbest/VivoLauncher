import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext.jsx'
import { sendToHost } from '../bridge.js'
import './LoginPage.css'

export default function LoginPage() {
  const { username, setUsername } = useUser()
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = () => {
    const trimmed = username.trim()
    if (trimmed.length < 3) {
      setError('Kullanıcı adı en az 3 karakter olmalı')
      return
    }
    setError('')
    sendToHost('login', { username: trimmed })
    navigate('/main')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className="login-container">
      <div className="login-page pixel-panel">
        <div className="login-page-explain">
          <h2 className="text-header">Login Page</h2>
          <p className="text-body">Simplified Minecraft Login Portal</p>
        </div>

        <div className="login-page-buttons">
          <div>
            <p className="text-body">username:</p>
            <input
              className="pixel-input"
              type="text"
              placeholder="username"
              maxLength={20}
              minLength={3}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {error && <p className="text-small login-error">{error}</p>}
          </div>

          <div>
            <button className="pixel-btn pixel-btn--full" onClick={handleLogin}>
              <span>Login now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
