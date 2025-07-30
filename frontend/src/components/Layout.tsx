import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, type ReactNode } from 'react'
import Footer from './Footer'
import BlockchainStatus from './BlockchainStatus'
import { Menu, X } from 'lucide-react'

export default function Layout({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const updateAuthState = () => {
      const auth = localStorage.getItem('auth') === 'true'
      const role = localStorage.getItem('role')
      setLoggedIn(auth)
      setIsAdmin(role === 'ADMIN')
    }

    updateAuthState()
    window.addEventListener('storage', updateAuthState)
    window.addEventListener('authChange', updateAuthState)

    return () => {
      window.removeEventListener('storage', updateAuthState)
      window.removeEventListener('authChange', updateAuthState)
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('auth')
    localStorage.removeItem('role')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setLoggedIn(false)
    setIsAdmin(false)
    setIsMenuOpen(false)
    window.dispatchEvent(new Event('authChange'))
    navigate('/')
  }

  const isActive = (path: string) => location.pathname === path ? 'text-blue-600 font-semibold' : 'text-gray-700'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-extrabold text-gray-900 animate-fade-in">ClearVote</Link>
            <BlockchainStatus />
          </div>
          <div className="hidden md:flex items-center space-x-8 text-base font-medium">
            <Link to="/" className={`${isActive('/')} hover:text-blue-600 transition-colors duration-200`}>Home</Link>
            <Link to="/about" className={`${isActive('/about')} hover:text-blue-600 transition-colors duration-200`}>About</Link>
            <Link to="/dashboard" className={`${isActive('/dashboard')} hover:text-blue-600 transition-colors duration-200`}>Elections</Link>
            <Link to="/tally" className={`${isActive('/tally')} hover:text-blue-600 transition-colors duration-200`}>Results</Link>
            {loggedIn && !isAdmin && <Link to="/dashboard" className={`${isActive('/dashboard')} hover:text-blue-600 transition-colors duration-200`}>Vote</Link>}
            {isAdmin && <Link to="/create-election" className={`${isActive('/create-election')} hover:text-blue-600 transition-colors duration-200`}>Create Election</Link>}
            {isAdmin && <Link to="/voters" className={`${isActive('/voters')} hover:text-blue-600 transition-colors duration-200`}>Voters</Link>}
            {isAdmin && <Link to="/admin/blockchain" className={`${isActive('/admin/blockchain')} hover:text-blue-600 transition-colors duration-200`}>Blockchain Results</Link>}
            {!loggedIn ? (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-sm"
                aria-label="Log in to ClearVote"
              >
                Login
              </Link>
            ) : (
              <button
                onClick={logout}
                className="text-red-600 font-semibold hover:text-red-700 transition-colors duration-200"
                aria-label="Log out of ClearVote"
              >
                Logout
              </button>
            )}
          </div>
          <button
            className="md:hidden text-gray-700 hover:text-blue-600 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg border-t border-gray-200">
            <div className="container mx-auto px-6 py-4 flex flex-col space-y-4 text-base font-medium">
              <Link
                to="/"
                className={`${isActive('/')} hover:text-blue-600 transition-colors duration-200`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`${isActive('/about')} hover:text-blue-600 transition-colors duration-200`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/dashboard"
                className={`${isActive('/dashboard')} hover:text-blue-600 transition-colors duration-200`}
                onClick={() => setIsMenuOpen(false)}
              >
                Elections
              </Link>
              <Link
                to="/tally"
                className={`${isActive('/tally')} hover:text-blue-600 transition-colors duration-200`}
                onClick={() => setIsMenuOpen(false)}
              >
                Results
              </Link>
              {loggedIn && !isAdmin && (
                <Link
                  to="/dashboard"
                  className={`${isActive('/dashboard')} hover:text-blue-600 transition-colors duration-200`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Vote
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/create-election"
                  className={`${isActive('/create-election')} hover:text-blue-600 transition-colors duration-200`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Create Election
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/voters"
                  className={`${isActive('/voters')} hover:text-blue-600 transition-colors duration-200`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Voters
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin/blockchain"
                  className={`${isActive('/admin/blockchain')} hover:text-blue-600 transition-colors duration-200`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Blockchain Results
                </Link>
              )}
              {!loggedIn ? (
                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 text-center"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Log in to ClearVote"
                >
                  Login
                </Link>
              ) : (
                <button
                  onClick={logout}
                  className="text-red-600 font-semibold hover:text-red-700 transition-colors duration-200 text-center"
                  aria-label="Log out of ClearVote"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow flex justify-center items-center px-6 sm:px-8">
        {children}
      </main>

      <Footer />
    </div>
  )
}