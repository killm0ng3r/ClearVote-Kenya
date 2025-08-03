import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import Layout from '../components/Layout'

interface County {
  id: number
  name: string
  code: number
}

interface Constituency {
  id: string
  name: string
  countyId: number
}

interface Ward {
  id: string
  name: string
  constituencyId: string
}

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const [counties, setCounties] = useState<County[]>([])
  const [constituencies, setConstituencies] = useState<Constituency[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [selectedCounty, setSelectedCounty] = useState('')
  const [selectedConstituency, setSelectedConstituency] = useState('')
  const [selectedWard, setSelectedWard] = useState('')

  useEffect(() => {
    const fetchCounties = async () => {
      try {
        const res = await fetch('http://localhost:3002/api/geography/counties')
        if (res.ok) {
          const data = await res.json()
          setCounties(data)
        }
      } catch (error) {
        console.error('Error fetching counties:', error)
      }
    }
    fetchCounties()
  }, [])

  useEffect(() => {
    if (selectedCounty) {
      const fetchConstituencies = async () => {
        try {
          const res = await fetch(`http://localhost:3002/api/geography/counties/${selectedCounty}/constituencies`)
          if (res.ok) {
            const data = await res.json()
            setConstituencies(data)
            setSelectedConstituency('')
            setSelectedWard('')
            setWards([])
          }
        } catch (error) {
          console.error('Error fetching constituencies:', error)
        }
      }
      fetchConstituencies()
    } else {
      setConstituencies([])
      setSelectedConstituency('')
      setSelectedWard('')
      setWards([])
    }
  }, [selectedCounty])

  useEffect(() => {
    if (selectedConstituency) {
      const fetchWards = async () => {
        try {
          const res = await fetch(`http://localhost:3002/api/geography/constituencies/${selectedConstituency}/wards`)
          if (res.ok) {
            const data = await res.json()
            setWards(data)
            setSelectedWard('')
          }
        } catch (error) {
          console.error('Error fetching wards:', error)
        }
      }
      fetchWards()
    } else {
      setWards([])
      setSelectedWard('')
    }
  }, [selectedConstituency])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      setLoading(false)
      return
    }

    // Validate location fields
    if (!selectedCounty) {
      toast.error("Please select your county")
      setLoading(false)
      return
    }

    if (!selectedConstituency) {
      toast.error("Please select your constituency")
      setLoading(false)
      return
    }

    if (!selectedWard) {
      toast.error("Please select your ward")
      setLoading(false)
      return
    }

    try {
      const payload = {
        name,
        email,
        password,
        countyId: selectedCounty,
        constituencyId: selectedConstituency,
        wardId: selectedWard
      }

      const res = await fetch('http://localhost:3002/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Registration failed')
        return
      }

      const data = await res.json()
      localStorage.setItem('auth', 'true')
      localStorage.setItem('token', data.token)
      localStorage.setItem('role', data.role)
      localStorage.setItem('user', JSON.stringify(data.user))

      toast.success('Registration successful!')
      navigate('/dashboard')
    } catch (err) {
      toast.error('Registration error')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <section className="py-24 md:py-32 bg-gray-50 flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="max-w-lg w-full space-y-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center mb-6 tracking-tight animate-fade-in-up">
              Create Your ClearVote Account
            </h2>
            <p className="text-center text-sm md:text-base text-gray-700">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-200"
                aria-label="Sign in to ClearVote"
              >
                Sign in here
              </Link>
            </p>
          </div>
          <form
            onSubmit={handleRegister}
            className="bg-white p-8 rounded-xl shadow-lg space-y-6 animate-fade-in-up animation-delay-200"
          >
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 text-gray-700"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
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
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 text-gray-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 text-gray-700"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  aria-required="true"
                />
              </div>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 tracking-tight">
                Location Information
              </h3>
              <p className="text-sm md:text-base text-gray-700 mb-4 leading-relaxed">
                Select your location to participate in elections. This information is required for registration.
              </p>
              <div className="space-y-6">
                <div>
                  <label htmlFor="county" className="block text-sm font-medium text-gray-700 mb-1">
                    County
                  </label>
                  <select
                    id="county"
                    value={selectedCounty}
                    onChange={(e) => setSelectedCounty(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 text-gray-700"
                    aria-label="Select your county"
                    required
                  >
                    <option value="">Select County</option>
                    {counties.map((county) => (
                      <option key={county.id} value={county.id}>
                        {county.name}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedCounty && (
                  <div>
                    <label htmlFor="constituency" className="block text-sm font-medium text-gray-700 mb-1">
                      Constituency
                    </label>
                    <select
                      id="constituency"
                      value={selectedConstituency}
                      onChange={(e) => setSelectedConstituency(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 text-gray-700"
                      aria-label="Select your constituency"
                      required
                    >
                      <option value="">Select Constituency</option>
                      {constituencies.map((constituency) => (
                        <option key={constituency.id} value={constituency.id}>
                          {constituency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {selectedConstituency && (
                  <div>
                    <label htmlFor="ward" className="block text-sm font-medium text-gray-700 mb-1">
                      Ward
                    </label>
                    <select
                      id="ward"
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 text-gray-700"
                      aria-label="Select your ward"
                      required
                    >
                      <option value="">Select Ward</option>
                      {wards.map((ward) => (
                        <option key={ward.id} value={ward.id}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Register for ClearVote"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
        </div>
      </section>
    </Layout>
  )
}