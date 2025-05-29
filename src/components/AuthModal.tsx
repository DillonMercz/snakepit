import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let result
      if (isLogin) {
        result = await signIn(email, password)
      } else {
        if (!username.trim()) {
          setError('Username is required')
          setLoading(false)
          return
        }
        result = await signUp(email, password, username)
      }

      if (result.error) {
        setError(result.error.message || 'An error occurred')
      } else {
        // Show success message briefly
        setError('')

        if (isLogin) {
          console.log('✅ Login successful!')
        } else {
          console.log('🎉 Account created successfully!')
        }

        // Call success callback and close modal
        onSuccess()

        // Reset form after a brief delay
        setTimeout(() => {
          onClose()
          setEmail('')
          setPassword('')
          setUsername('')
        }, 300)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError('')
  }

  if (!isOpen) return null

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <div className="auth-modal-header">
          <h2 className="neon-text neon-cyan">
            {isLogin ? '🐍 Welcome Back, Snake!' : '🎮 Join the Snake Pit'}
          </h2>
          <button className="close-button neon-button neon-orange" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="auth-intro">
          <p className="neon-text neon-dim">
            {isLogin ?
              'Ready to slither back into action?' :
              'Create your account to start earning real money!'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label className="neon-text neon-purple">Snake Name</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="neon-input neon-purple"
                placeholder="Enter your snake name..."
                maxLength={20}
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <label className="neon-text neon-green">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="neon-input neon-green"
              placeholder="Enter your email..."
              required
            />
          </div>

          <div className="form-group">
            <label className="neon-text neon-yellow">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="neon-input neon-yellow"
              placeholder="Enter your password..."
              minLength={6}
              required
            />
          </div>

          {error && (
            <div className="error-message neon-text neon-red">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="auth-submit-button neon-button neon-cyan"
          >
            {loading ? '⏳ Processing...' : isLogin ? '🚀 Enter Pit' : '🎯 Create Account'}
          </button>
        </form>

        <div className="auth-toggle">
          <p className="neon-text neon-dim">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </p>
          <button
            type="button"
            onClick={toggleMode}
            className="toggle-button neon-text neon-pink"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>

        <div className="auth-info">
          <p className="neon-text neon-dim">
            🔒 Your account is secured with Supabase authentication
          </p>
          <p className="neon-text neon-dim">
            💰 New players start with 1000 XRP balance
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthModal
