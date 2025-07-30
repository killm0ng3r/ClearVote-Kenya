import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Layout from '../components/Layout'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch('http://localhost:3002/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed')

      localStorage.setItem('auth', 'true')
      localStorage.setItem('token', data.token)
      localStorage.setItem('role', data.role)
      localStorage.setItem('user', JSON.stringify(data.user))

      window.dispatchEvent(new Event('authChange'))

      navigate('/dashboard')
    } catch (err) {
      alert('Login error')
      console.error(err)
    }
  }

  return (
    <Layout>
      <section className="py-24 md:py-32 bg-gray-50 flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md animate-fade-in-up"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Login to ClearVote
          </h2>
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 text-gray-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 text-gray-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-required="true"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-sm"
              aria-label="Log in to ClearVote"
            >
              Login
            </button>
            <p className="text-sm text-center text-gray-700">
              Not registered?{' '}
              <Link
                to="/register"
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-200"
                aria-label="Create a new ClearVote account"
              >
                Create an account
              </Link>
            </p>
          </div>
        </form>
      </section>
    </Layout>
  )
}