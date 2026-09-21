import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setMessage('')

    if (isSignup) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
      } else {
        setMessage('Account created successfully!')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
      } else {
        setMessage('Login successful!')
      }
    }
  }

  return (
    <div>
      <h1>{isSignup ? 'Create Account' : 'Login'}</h1>

      <form onSubmit={handleAuth}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        <button type="submit">
          {isSignup ? 'Sign Up' : 'Login'}
        </button>
      </form>

      {message && <p>{message}</p>}

      <button onClick={() => setIsSignup(!isSignup)}>
        {isSignup
          ? 'Already have an account? Login'
          : 'Create new account'}
      </button>
    </div>
  )
}
