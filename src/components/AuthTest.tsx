import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthTest: React.FC = () => {
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('testpassword123')
  const [username, setUsername] = useState('TestUser')
  const [result, setResult] = useState<string>('')

  const testSignUp = async () => {
    try {
      console.log('🧪 Testing signup...')
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      })
      
      if (error) {
        setResult(`❌ Signup Error: ${error.message}`)
        console.error('Signup error:', error)
      } else {
        setResult(`✅ Signup Success: ${data.user?.email}`)
        console.log('Signup success:', data)
      }
    } catch (err) {
      setResult(`❌ Signup Exception: ${err}`)
      console.error('Signup exception:', err)
    }
  }

  const testSignIn = async () => {
    try {
      console.log('🧪 Testing signin...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        setResult(`❌ Signin Error: ${error.message}`)
        console.error('Signin error:', error)
      } else {
        setResult(`✅ Signin Success: ${data.user?.email}`)
        console.log('Signin success:', data)
      }
    } catch (err) {
      setResult(`❌ Signin Exception: ${err}`)
      console.error('Signin exception:', err)
    }
  }

  const testConnection = async () => {
    try {
      console.log('🧪 Testing connection...')
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        setResult(`❌ Connection Error: ${error.message}`)
        console.error('Connection error:', error)
      } else {
        setResult(`✅ Connection Success: ${data.session ? 'Session exists' : 'No session'}`)
        console.log('Connection test:', data)
      }
    } catch (err) {
      setResult(`❌ Connection Exception: ${err}`)
      console.error('Connection exception:', err)
    }
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '1rem',
      borderRadius: '8px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h3>🧪 Supabase Auth Test</h3>
      
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <button onClick={testConnection} style={{ marginRight: '0.5rem', padding: '0.5rem' }}>
          Test Connection
        </button>
        <button onClick={testSignUp} style={{ marginRight: '0.5rem', padding: '0.5rem' }}>
          Test Signup
        </button>
        <button onClick={testSignIn} style={{ padding: '0.5rem' }}>
          Test Signin
        </button>
      </div>

      {result && (
        <div style={{ 
          background: result.includes('✅') ? 'rgba(0,255,0,0.2)' : 'rgba(255,0,0,0.2)',
          padding: '0.5rem',
          borderRadius: '4px',
          fontSize: '0.9rem'
        }}>
          {result}
        </div>
      )}
    </div>
  )
}

export default AuthTest
