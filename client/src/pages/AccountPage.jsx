import { motion } from 'framer-motion'
import { ChevronRight, LogOut, Package, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import CartDrawer from '../components/cart/CartDrawer'
import CheckoutDrawer from '../components/checkout/CheckoutDrawer'
import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'
import { useAuth } from '../context/AuthContext'

const statusColors = {
  pending: 'text-yellow-300 bg-yellow-500/15 border-yellow-500/20',
  confirmed: 'text-blue-300 bg-blue-500/15 border-blue-500/20',
  processing: 'text-orange-300 bg-orange-500/15 border-orange-500/20',
  shipped: 'text-purple-300 bg-purple-500/15 border-purple-500/20',
  delivered: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/20',
  cancelled: 'text-red-300 bg-red-500/15 border-red-500/20',
}

const formatCurrency = (v) => `৳${Number(v || 0).toLocaleString('en-BD')}`
const formatDate = (d) => new Date(d).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' })

export default function AccountPage() {
  const navigate = useNavigate()
  const { user, logout, isLoading } = useAuth()
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login')
    }
  }, [user, isLoading, navigate])

  useEffect(() => {
    if (!user) return
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/auth/orders')
        setOrders(data.orders || [])
      } catch {
        setOrders([])
      } finally {
        setOrdersLoading(false)
      }
    }
    fetchOrders()
  }, [user])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-midnight">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-glow-magenta" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-midnight text-white">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-glow-magenta/10 to-glow-purple/10 p-6 sm:p-8"
        >
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-glow-magenta to-glow-purple text-2xl font-bold text-white">
                {user.name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold text-white">{user.name}</h1>
                <p className="mt-1 text-sm text-white/60">{user.email}</p>
                {user.phone && <p className="mt-0.5 text-sm text-white/50">{user.phone}</p>}
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                to="/orders"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <Package size={16} />
                Track Order
              </Link>
              <button
                type="button"
                onClick={() => { logout(); navigate('/') }}
                className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-white/50">
                <User size={14} />
                <span className="text-xs uppercase tracking-wider">Name</span>
              </div>
              <p className="mt-2 font-semibold text-white">{user.name}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-white/50">
                <span className="text-xs uppercase tracking-wider">Email</span>
              </div>
              <p className="mt-2 truncate font-semibold text-white">{user.email}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-white/50">
                <span className="text-xs uppercase tracking-wider">Total Orders</span>
              </div>
              <p className="mt-2 font-semibold text-white">{ordersLoading ? '—' : orders.length}</p>
            </div>
          </div>
        </motion.div>

        {/* Orders */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold text-white">Order History</h2>
            <Link to="/orders" className="text-sm text-glow-magenta transition hover:underline">
              Track an order →
            </Link>
          </div>

          {ordersLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-glow-magenta" />
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-16 text-center">
              <Package size={48} className="mx-auto mb-4 text-white/20" />
              <p className="text-white/60">No orders found. Place your first order to see it here!</p>
              <Link
                to="/products"
                className="mt-6 inline-flex rounded-full bg-glow-magenta px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white"
                style={{ boxShadow: '0 0 24px rgba(213,16,110,0.35)' }}
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                >
                  <div className="flex flex-col items-start justify-between gap-3 p-5 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-heading text-lg font-bold text-white">{order.orderId}</span>
                        <span className={`inline-flex rounded-full border px-3 py-0.5 text-xs font-semibold capitalize ${statusColors[order.status] || statusColors.pending}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-white/50">{formatDate(order.createdAt)}</p>
                      <p className="mt-1 text-sm text-white/60">{order.items?.length || 0} item(s)</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-white/45 uppercase tracking-wider">Total</p>
                        <p className="text-xl font-bold text-white">{formatCurrency(order.total)}</p>
                      </div>
                      <Link
                        to={`/orders/${order.orderId}`}
                        className="flex items-center gap-1 rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:border-glow-magenta/40 hover:text-white"
                      >
                        Track <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                  {order.items?.length > 0 && (
                    <div className="border-t border-white/10 px-5 py-3">
                      <p className="text-xs text-white/40 truncate">
                        {order.items.map((i) => i.name).join(', ')}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <CartDrawer />
      <CheckoutDrawer />
    </div>
  )
}

