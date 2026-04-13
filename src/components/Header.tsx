import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isGuest, signOut, isLoading } = useAuth()

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setMobileMenuOpen(false)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-sudoku flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: 'var(--color-primary-blue)' }}
          >
            S
          </div>
          <span
            className="font-bold text-lg hidden sm:inline"
            style={{ color: 'var(--color-neutral-dark)' }}
          >
            Sudoku Trainer
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 items-center">
          <Link
            to="/"
            className="font-medium transition-colors hover:opacity-70"
            style={{ color: 'var(--color-neutral-dark)' }}
          >
            Home
          </Link>
          <Link
            to="/curriculum"
            className="font-medium transition-colors hover:opacity-70"
            style={{ color: 'var(--color-neutral-dark)' }}
          >
            Curriculum
          </Link>
          <Link
            to="/profile"
            className="font-medium transition-colors hover:opacity-70"
            style={{ color: 'var(--color-neutral-dark)' }}
          >
            Profile
          </Link>

          {/* Auth Section */}
          {isLoading ? null : isGuest ? (
            <Link
              to="/auth"
              className="font-medium px-4 py-2 rounded transition-colors"
              style={{
                backgroundColor: 'var(--color-primary-blue)',
                color: 'white',
              }}
            >
              Sign In
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <span style={{ color: 'var(--color-neutral-dark)' }}>
                {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="font-medium px-4 py-2 rounded transition-colors"
                style={{
                  backgroundColor: 'var(--color-neutral-light)',
                  color: 'var(--color-neutral-dark)',
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <div
            className="w-6 h-0.5 transition-all"
            style={{ backgroundColor: 'var(--color-neutral-dark)' }}
          ></div>
          <div
            className="w-6 h-0.5 transition-all"
            style={{ backgroundColor: 'var(--color-neutral-dark)' }}
          ></div>
          <div
            className="w-6 h-0.5 transition-all"
            style={{ backgroundColor: 'var(--color-neutral-dark)' }}
          ></div>
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav
          className="md:hidden border-t"
          style={{ borderColor: 'var(--color-neutral-light)' }}
        >
          <div className="container-sudoku py-4 flex flex-col gap-3">
            <Link
              to="/"
              className="font-medium transition-colors hover:opacity-70 block py-2"
              style={{ color: 'var(--color-neutral-dark)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/curriculum"
              className="font-medium transition-colors hover:opacity-70 block py-2"
              style={{ color: 'var(--color-neutral-dark)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Curriculum
            </Link>
            <Link
              to="/profile"
              className="font-medium transition-colors hover:opacity-70 block py-2"
              style={{ color: 'var(--color-neutral-dark)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile
            </Link>

            {/* Mobile Auth Section */}
            {!isLoading && (
              <div className="py-2 border-t" style={{ borderColor: 'var(--color-neutral-light)' }}>
                {isGuest ? (
                  <Link
                    to="/auth"
                    className="font-medium block py-2 px-4 rounded"
                    style={{
                      backgroundColor: 'var(--color-primary-blue)',
                      color: 'white',
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                ) : (
                  <>
                    <div className="py-2 px-4" style={{ color: 'var(--color-neutral-dark)' }}>
                      {user?.email}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left font-medium py-2 px-4 rounded transition-colors"
                      style={{
                        backgroundColor: 'var(--color-neutral-light)',
                        color: 'var(--color-neutral-dark)',
                      }}
                    >
                      Sign Out
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
