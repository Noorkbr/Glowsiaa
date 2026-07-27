import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Login', to: '/login' }
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cartCount, openDrawer } = useCart()
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  const handleUserAction = () => {
    if (user) {
      logout()
      navigate('/')
      return
    }
    navigate('/login')
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b border-white/10 bg-midnight/50 transition-all duration-300 ${
        isScrolled ? 'shadow-[0_16px_40px_rgba(0,0,0,0.35)]' : ''
      }`}
      style={{ backdropFilter: 'blur(20px)' }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
          className="rounded-full border border-white/10 p-2 text-white transition hover:border-white/20 hover:bg-white/5 md:hidden"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="hidden md:block md:w-28" />

        <Link
          to="/"
          className="text-center font-heading text-2xl font-bold tracking-[0.35em] sm:text-3xl"
          style={{
            background: 'linear-gradient(to right, #D5106E, #6E3992)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          GLOWSIAA
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <button type="button" className="rounded-full p-2 text-white/80 transition hover:bg-white/5 hover:text-white" aria-label="Search">
            <Search size={20} />
          </button>
          <button type="button" className="rounded-full p-2 text-white/80 transition hover:bg-white/5 hover:text-white" aria-label="Wishlist">
            <Heart size={20} />
          </button>
          <button
            type="button"
            onClick={openDrawer}
            className="relative rounded-full p-2 text-white/80 transition hover:bg-white/5 hover:text-white"
            aria-label="Open cart"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-glow-magenta px-1 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={handleUserAction}
            className="rounded-full p-2 text-white/80 transition hover:bg-white/5 hover:text-white"
            aria-label={user ? 'Logout' : 'Login'}
          >
            <User size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/10 bg-[#11111b] md:hidden"
          >
            <nav className="flex flex-col px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-white/85 transition hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
