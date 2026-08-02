import { AnimatePresence, motion } from 'framer-motion'
import { Heart, LogOut, Menu, Moon, Package, Search, ShoppingBag, Sun, User, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useLanguage } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'
import { useWishlist } from '../../context/WishlistContext'
import SearchModal from './SearchModal'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cartCount, openDrawer } = useCart()
  const { wishlistCount } = useWishlist()
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { lang, toggleLang, t } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userRef = useRef(null)

  const navLinks = [
    { label: t('home'),     to: '/' },
    { label: t('products'), to: '/products' },
    { label: t('track'),    to: '/orders' },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => { setMenuOpen(false); setUserMenuOpen(false) }, [location.pathname])
  useEffect(() => {
    const handler = (e) => { if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isActive = (p) => p === '/' ? location.pathname === '/' : location.pathname.startsWith(p)

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 transition-all duration-500"
        style={{
          background: scrolled
            ? 'rgba(5,5,10,0.82)'
            : 'rgba(5,5,10,0.25)',
          backdropFilter: scrolled ? 'blur(28px) saturate(1.8)' : 'blur(12px)',
          WebkitBackdropFilter: scrolled ? 'blur(28px) saturate(1.8)' : 'blur(12px)',
          borderBottom: scrolled ? '1px solid rgba(213,16,110,0.12)' : '1px solid rgba(255,255,255,0.05)',
          boxShadow: scrolled ? '0 4px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(213,16,110,0.06)' : 'none',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Mobile hamburger */}
          <button type="button" onClick={() => setMenuOpen(v => !v)}
            className="rounded-full border border-white/10 p-2 text-white/70 transition hover:border-white/20 hover:bg-white/5 md:hidden">
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>

          {/* Desktop: Logo + Nav */}
          <div className="hidden items-center gap-8 md:flex">
            <Link to="/" className="font-heading text-2xl font-black tracking-[0.32em]"
              style={{ background: 'linear-gradient(135deg, #D5106E, #9B2FD0, #6E3992)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              GLOWSIAA
            </Link>
            <nav className="flex items-center gap-6">
              {navLinks.map(l => <NavLink key={l.to} {...l} isActive={isActive(l.to)} />)}
            </nav>
          </div>

          {/* Mobile: logo */}
          <Link to="/" className="font-heading text-2xl font-black tracking-[0.32em] md:hidden"
            style={{ background: 'linear-gradient(135deg, #D5106E, #9B2FD0, #6E3992)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            GLOWSIAA
          </Link>

          {/* Right Icons */}
          <div className="flex items-center gap-1">
            {/* Language Toggle */}
            <motion.button type="button" whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}
              onClick={toggleLang}
              title={lang === 'en' ? 'Switch to Bangla' : 'Switch to English'}
              className="rounded-full border border-white/15 px-2.5 py-1 text-xs font-bold text-white/70 transition hover:border-glow-magenta/40 hover:text-white">
              {lang === 'en' ? 'বাং' : 'EN'}
            </motion.button>

            {/* Search */}
            <motion.button type="button" whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
              onClick={() => setSearchOpen(true)}
              className="rounded-full p-2 text-white/65 transition hover:bg-white/5 hover:text-white">
              <Search size={19} />
            </motion.button>

            {/* Theme */}
            <motion.button type="button" whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="rounded-full p-2 text-white/65 transition hover:bg-white/5 hover:text-white">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={isDark ? 'sun' : 'moon'}
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }} className="block">
                  {isDark ? <Sun size={19} /> : <Moon size={19} />}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            {/* Wishlist */}
            <motion.button type="button" whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/wishlist')}
              className="relative rounded-full p-2 text-white/65 transition hover:bg-white/5 hover:text-white">
              <Heart size={19} />
              <Badge count={wishlistCount} />
            </motion.button>

            {/* Cart */}
            <motion.button type="button" whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
              onClick={openDrawer}
              className="relative rounded-full p-2 text-white/65 transition hover:bg-white/5 hover:text-white">
              <ShoppingBag size={19} />
              <Badge count={cartCount} />
            </motion.button>

            {/* User */}
            {user ? (
              <div ref={userRef} className="relative">
                <motion.button type="button" whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="ml-1 flex h-9 w-9 items-center justify-center rounded-full font-bold text-sm text-white"
                  style={{ background: 'linear-gradient(135deg, #D5106E, #6E3992)', boxShadow: '0 0 18px rgba(213,16,110,0.45)' }}>
                  {user.name?.charAt(0).toUpperCase()}
                </motion.button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-2xl glass-dark"
                      style={{ border: '1px solid rgba(213,16,110,0.2)' }}>
                      <div className="border-b border-white/8 px-4 py-3">
                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                        <p className="text-xs text-white/40 truncate">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <button type="button" onClick={() => navigate('/account')}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 transition hover:bg-white/5 hover:text-white">
                          <Package size={15} /> {t('myOrders')}
                        </button>
                        <button type="button" onClick={() => { logout(); navigate('/') }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10">
                          <LogOut size={15} /> {t('logout')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button type="button" whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
                onClick={() => navigate('/login')}
                className="ml-1 rounded-full p-2 text-white/65 transition hover:bg-white/5 hover:text-white">
                <User size={19} />
              </motion.button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/8 glass-dark md:hidden">
              <nav className="flex flex-col gap-1 px-4 py-3">
                {navLinks.map(l => (
                  <Link key={l.to} to={l.to}
                    className={`rounded-xl px-3 py-3 text-sm font-medium transition ${isActive(l.to) ? 'bg-glow-magenta/15 text-glow-magenta' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                    {l.label}
                  </Link>
                ))}
                {user && <Link to="/account" className="rounded-xl px-3 py-3 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white">{t('account')}</Link>}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

const NavLink = ({ to, label, isActive }) => (
  <Link to={to} className="relative px-1 py-0.5 text-sm font-medium group">
    <span className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-white/55 group-hover:text-white'}`}>{label}</span>
    {isActive && (
      <motion.div layoutId="nav-indicator"
        className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-glow-magenta"
        style={{ boxShadow: '0 0 8px rgba(213,16,110,0.8)' }} />
    )}
  </Link>
)

const Badge = ({ count }) => (
  <AnimatePresence>
    {count > 0 && (
      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
        className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-glow-magenta px-1 text-[10px] font-black text-white"
        style={{ boxShadow: '0 0 10px rgba(213,16,110,0.7)' }}>
        {count}
      </motion.span>
    )}
  </AnimatePresence>
)

