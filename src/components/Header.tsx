import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
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
        <nav className="hidden md:flex gap-8">
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
          </div>
        </nav>
      )}
    </header>
  )
}
