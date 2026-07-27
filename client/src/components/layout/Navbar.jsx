import { AnimatePresence, motion } from 'framer-motion'
import { Heart, LogOut, Menu, Moon, Package, Search, ShoppingBag, Sun, User, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useTheme } from '../../context/ThemeContext'
import { useWishlist } from '../../context/WishlistContext'
import SearchModal from './SearchModal'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Track Order', to: '/orders' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cartCount, openDrawer } = useCart()
  const { wishlistCount } = useWishlist()
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
    setIsUserMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b border-white/10 bg-midnight/50 transition-all duration-300 ${
          isScrolled ? 'shadow-[0_16px_40px_rgba(0,0,0,0.35)]' : ''
        }`}
        style={{ backdropFilter: 'blur(20px)' }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Mobile: hamburger */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((c) => !c)}
            className="rounded-full border border-white/10 p-2 text-white transition hover:border-white/20 hover:bg-white/5 md:hidden"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Desktop: Logo + Nav */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              to="/"
              className="font-heading text-2xl font-bold tracking-[0.35em] sm:text-3xl"
              style={{
                background: 'linear-gradient(to right, #D5106E, #6E3992)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              GLOWSIAA
            </Link>
            <nav className="flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive(link.to)
                      ? 'bg-white/10 text-white'
                      : 'text-white/65 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Mobile: Logo centered */}
          <Link
            to="/"
            className="font-heading text-2xl font-bold tracking-[0.35em] md:hidden"
            style={{
              background: 'linear-gradient(to right, #D5106E, #6E3992)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            GLOWSIAA
          </Link>

          {/* Right: Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <motion.button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="rounded-full p-2 text-white/80 transition hover:bg-white/5 hover:text-white"
              aria-label="Search"
            >
              <Search size={20} />
            </motion.button>

            {/* Theme toggle */}
            <motion.button
              type="button"
              onClick={toggleTheme}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="rounded-full p-2 text-white/80 transition hover:bg-white/5 hover:text-white"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isDark ? 'moon' : 'sun'}
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.22 }}
                  className="block"
                >
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            <motion.button
              type="button"
              onClick={() => navigate('/wishlist')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative rounded-full p-2 text-white/80 transition hover:bg-white/5 hover:text-white"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              <AnimatePresence>
                {wishlistCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-glow-purple px-1 text-[10px] font-semibold text-white"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              type="button"
              onClick={openDrawer}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative rounded-full p-2 text-white/80 transition hover:bg-white/5 hover:text-white"
              aria-label="Open cart"
            >
              <ShoppingBag size={20} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-glow-magenta px-1 text-[10px] font-semibold text-white"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((c) => !c)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-glow-magenta to-glow-purple text-sm font-bold text-white transition hover:scale-105"
                  aria-label="User menu"
                >
                  {user.name?.charAt(0).toUpperCase() ?? 'U'}
                </button>
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-2xl border border-white/10 bg-[#11111b] shadow-xl"
                    >
                      <div className="border-b border-white/10 px-4 py-3">
                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                        <p className="text-xs text-white/45 truncate">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <button
                          type="button"
                          onClick={() => navigate('/account')}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/5 hover:text-white"
                        >
                          <Package size={16} />
                          My Orders
                        </button>
                        <button
                          type="button"
                          onClick={() => { logout(); navigate('/') }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="rounded-full p-2 text-white/80 transition hover:bg-white/5 hover:text-white"
                aria-label="Login"
              >
                <User size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-white/10 bg-[#0d0d18] md:hidden"
            >
              <nav className="flex flex-col px-4 py-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`rounded-xl px-3 py-3 text-sm font-medium transition ${
                      isActive(link.to)
                        ? 'bg-glow-magenta/15 text-glow-magenta'
                        : 'text-white/85 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {user && (
                  <Link
                    to="/account"
                    className="rounded-xl px-3 py-3 text-sm font-medium text-white/85 transition hover:bg-white/5 hover:text-white"
                  >
                    My Account
                  </Link>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
