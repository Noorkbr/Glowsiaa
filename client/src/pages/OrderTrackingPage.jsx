import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'

const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered']
const formatCurrency = (value) => `৳${Number(value || 0).toLocaleString('en-BD')}`

export default function OrderTrackingPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [query, setQuery] = useState(orderId ?? '')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(Boolean(orderId))
  const [error, setError] = useState('')

  const fetchOrder = async (id) => {
    if (!id) return
    try {
      setLoading(true)
      setError('')
      const { data } = await api.get(`/orders/${id}`)
      setOrder(data?.order ?? data?.data ?? data)
    } catch {
      setOrder(null)
      setError('We could not find an order with that ID.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orderId) {
      setQuery(orderId)
      fetchOrder(orderId)
    }
  }, [orderId])

  const currentStatusIndex = useMemo(() => {
    const status = order?.status ? `${order.status}`.toLowerCase() : 'pending'
    if (status === 'cancelled') return -1
    const matchedIndex = statuses.findIndex((item) => item.toLowerCase() === status)
    return matchedIndex === -1 ? 0 : matchedIndex
  }, [order])

  const totals = useMemo(() => {
    const subtotal = order?.subtotal ?? order?.items?.reduce((sum, item) => sum + Number(item?.price || 0) * Number(item?.quantity || 0), 0) ?? 0
    const deliveryFee = order?.deliveryFee ?? order?.shippingFee ?? 0
    const total = order?.total ?? subtotal + deliveryFee
    return { subtotal, deliveryFee, total }
  }, [order])

  return (
    <div className="min-h-screen bg-midnight text-white">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-glow-magenta">Track your order</p>
              <h1 className="mt-3 font-heading text-4xl font-bold text-white">Order updates in real time</h1>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                if (query.trim()) {
                  navigate(`/orders/${query.trim()}`)
                }
              }}
              className="relative w-full max-w-md"
            >
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Enter your order ID"
                className="w-full rounded-full border border-white/10 bg-[#14141f] py-3 pl-11 pr-4 text-white outline-none transition focus:border-glow-magenta"
              />
            </form>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-glow-magenta" />
            </div>
          ) : error ? (
            <div className="mt-10 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-red-300">{error}</div>
          ) : !order ? (
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-8 text-white/60">Search for your order ID to see delivery progress.</div>
          ) : order?.status?.toLowerCase() === 'cancelled' ? (
            <div className="mt-10 rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-6">
              <h2 className="font-heading text-2xl font-semibold text-red-200">Order Cancelled</h2>
              <p className="mt-2 text-red-100/80">This order has been cancelled. Please contact support if you need assistance.</p>
            </div>
          ) : (
            <div className="mt-10 space-y-10">
              <div className="grid gap-4 md:grid-cols-5">
                {statuses.map((status, index) => {
                  const completed = index <= currentStatusIndex
                  return (
                    <div key={status} className="relative rounded-2xl border border-white/10 bg-[#14141f] px-4 py-5 text-center">
                      <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold ${completed ? 'border-glow-magenta bg-glow-magenta text-white' : 'border-white/10 bg-white/5 text-white/55'}`}>
                        {index + 1}
                      </div>
                      <div className={`text-sm font-semibold ${completed ? 'text-glow-magenta' : 'text-white/55'}`}>{status}</div>
                    </div>
                  )
                })}
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-3xl border border-white/10 bg-[#14141f] p-6">
                  <h2 className="font-heading text-2xl font-semibold text-white">Items</h2>
                  <div className="mt-5 space-y-4">
                    {(order?.items ?? []).map((item, index) => (
                      <div key={`${item?.product ?? item?._id ?? index}`} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                        <div>
                          <h3 className="font-medium text-white">{item?.name}</h3>
                          <p className="mt-1 text-sm text-white/55">Qty {item?.quantity}</p>
                        </div>
                        <span className="font-semibold text-white">{formatCurrency(Number(item?.price || 0) * Number(item?.quantity || 0))}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-3xl border border-white/10 bg-[#14141f] p-6">
                    <h2 className="font-heading text-2xl font-semibold text-white">Customer Info</h2>
                    <div className="mt-4 space-y-3 text-white/70">
                      <p><span className="font-semibold text-white">Name:</span> {order?.customer?.name ?? 'N/A'}</p>
                      <p><span className="font-semibold text-white">Phone:</span> {order?.customer?.phone ?? 'N/A'}</p>
                      <p><span className="font-semibold text-white">Address:</span> {order?.customer?.address ?? 'N/A'}</p>
                      <p><span className="font-semibold text-white">Location:</span> {order?.customer?.location ?? 'N/A'}</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-[#14141f] p-6">
                    <h2 className="font-heading text-2xl font-semibold text-white">Totals</h2>
                    <div className="mt-4 space-y-3 text-white/70">
                      <div className="flex items-center justify-between"><span>Subtotal</span><span>{formatCurrency(totals.subtotal)}</span></div>
                      <div className="flex items-center justify-between"><span>Delivery Fee</span><span>{formatCurrency(totals.deliveryFee)}</span></div>
                      <div className="flex items-center justify-between text-lg font-bold text-white"><span>Total</span><span>{formatCurrency(totals.total)}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
