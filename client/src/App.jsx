import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Component } from 'react'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { SiteSettingsProvider, useSiteSettings } from './context/SiteSettingsContext'
import { RealtimeProvider } from './context/RealtimeContext'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider } from './context/ThemeContext'
import { WishlistProvider } from './context/WishlistContext'
import LoadingBar from './components/ui/LoadingBar'
import ScrollProgress from './components/ui/ScrollProgress'
import CustomCursor from './components/ui/CustomCursor'
import FacebookPixel from './components/tracking/FacebookPixel'
import AccountPage from './pages/AccountPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import PaymentCallbackPage from './pages/PaymentCallbackPage'
import OrderTrackingPage from './pages/OrderTrackingPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ProductsPage from './pages/ProductsPage'
import RegisterPage from './pages/RegisterPage'
import WishlistPage from './pages/WishlistPage'

const pageVariants = {
  initial: { opacity: 0, y: 16, scale: 0.99, filter: 'blur(4px)' },
  enter:   { opacity: 1, y: 0,  scale: 1,    filter: 'blur(0px)', transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8, scale: 1.005, filter: 'blur(2px)', transition: { duration: 0.25 } },
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="enter" exit="exit">
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/orders" element={<OrderTrackingPage />} />
          <Route path="/orders/:orderId" element={<OrderTrackingPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/payment/success" element={<PaymentCallbackPage />} />
            <Route path="/payment/failed" element={<PaymentCallbackPage />} />
            <Route path="/payment/cancelled" element={<PaymentCallbackPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

// Inner component so it can call useSiteSettings() inside SiteSettingsProvider
function RealtimeGate({ children }) {
  const { applySettings } = useSiteSettings()
  return <RealtimeProvider onSettings={applySettings}>{children}</RealtimeProvider>
}

// Error boundary — shows error message instead of blank page on any crash
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', background: '#05050A', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'sans-serif' }}>
          <p style={{ color: '#D5106E', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>⚠️ Glowsiaa</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>Something went wrong. Please refresh the page.</p>
          <pre style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', maxWidth: '600px', overflow: 'auto' }}>{this.state.error?.message}</pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: '1.5rem', background: '#D5106E', color: '#fff', border: 'none', borderRadius: '9999px', padding: '0.75rem 2rem', cursor: 'pointer', fontWeight: 'bold' }}>Refresh</button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <ErrorBoundary>
    <ThemeProvider>
      <LanguageProvider>
      <SiteSettingsProvider>
        <RealtimeGate>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
          <Toaster
            position="top-right"
            gutter={10}
            toastOptions={{
              duration: 2800,
              style: {
                background: 'rgba(5,5,10,0.95)',
                color: '#fff',
                border: '1px solid rgba(213,16,110,0.35)',
                borderRadius: '16px',
                fontSize: '0.875rem',
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(213,16,110,0.12)',
                backdropFilter: 'blur(20px)',
                padding: '12px 16px',
              },
              success: { iconTheme: { primary: '#D5106E', secondary: '#fff' } },
            }}
          />
          <LoadingBar />
          <ScrollProgress />
          <CustomCursor />
          <FacebookPixel />
            <AnimatedRoutes />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
        </RealtimeGate>
      </SiteSettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
    </ErrorBoundary>
  )
}
