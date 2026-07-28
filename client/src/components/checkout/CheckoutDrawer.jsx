import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Tag, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useCart } from '../../context/CartContext'

const fmt = (v) => `৳${Number(v || 0).toLocaleString('en-BD')}`
const phoneRegex = /^01[0-9]{9}$/
const getImg = (image) => {
  if (!image) return 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&q=60'
  if (typeof image === 'string') return image
  return image.url || image.secure_url || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&q=60'
}

const INIT_FORM = { name: '', phone: '', address: '', location: 'inside_dhaka', paymentMethod: 'cod' }

export default function CheckoutDrawer() {
  const { items: cartItems, cartTotal, isCheckoutOpen, closeCheckout, clearCart } = useCart()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState(INIT_FORM)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [placedOrderId, setPlacedOrderId] = useState('')
  const [error, setError] = useState('')
  const [gateways, setGateways] = useState({ bkash: { enabled: false }, nagad: { enabled: false }, cod: { enabled: true } })

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [couponData, setCouponData] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  useEffect(() => {
    api.get('/payments/gateways').then(({ data }) => setGateways(data.gateways || {})).catch(() => {})
  }, [])

  useEffect(() => {
    if (!isCheckoutOpen) {
      setStep(1); setLoading(false); setSuccess(false); setPlacedOrderId(''); setError('')
      setForm(INIT_FORM); setCouponCode(''); setCouponData(null); setCouponError('')
    }
  }, [isCheckoutOpen])

  const deliveryFee = useMemo(() => form.location === 'outside_dhaka' ? 120 : 60, [form.location])
  const discount = useMemo(() => couponData?.discountAmount || 0, [couponData])
  const grandTotal = cartTotal + deliveryFee - discount

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (name === 'paymentMethod') setCouponData(null) // reset coupon on method change
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true); setCouponError('')
    try {
      const { data } = await api.post('/coupons/validate', { code: couponCode.trim(), orderTotal: cartTotal + deliveryFee })
      setCouponData(data)
    } catch (e) {
      setCouponError(e.response?.data?.message || 'Invalid coupon')
      setCouponData(null)
    }
    setCouponLoading(false)
  }

  const removeCoupon = () => { setCouponData(null); setCouponCode(''); setCouponError('') }

  const handleContinue = () => {
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError('Please fill in all required fields.'); return
    }
    if (!phoneRegex.test(form.phone.trim())) {
      setError('Please enter a valid Bangladeshi mobile number.'); return
    }
    setError(''); setStep(2)
  }

  const handlePlaceOrder = async () => {
    if (!cartItems.length) { setError('Your cart is empty.'); return }
    setLoading(true); setError('')

    try {
      // First create the order in DB
      const payload = {
        customer: { name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim(), location: form.location },
        items: cartItems.map(i => ({ product: i._id ?? i.id, name: i.name, price: i.price, quantity: i.quantity, image: getImg(i.images?.[0] ?? i.image) })),
        paymentMethod: form.paymentMethod,
        couponCode: couponData?.coupon?.code,
        discount,
        notes: couponData ? `Coupon: ${couponData.coupon.code}` : undefined,
      }

      const { data: orderData } = await api.post('/orders', payload)
      const orderId = orderData?.order?.orderId ?? orderData?.orderId ?? 'Pending'

      if (form.paymentMethod === 'bkash') {
        // Redirect to bKash payment
        const { data: bkData } = await api.post('/payments/bkash/create', {
          amount: grandTotal,
          orderId,
          callbackURL: `${window.location.origin}/payment/bkash-callback`,
        })
        clearCart()
        window.location.href = bkData.bkashURL
        return
      }

      if (form.paymentMethod === 'nagad') {
        const { data: ngData } = await api.post('/payments/nagad/create', {
          amount: grandTotal,
          orderId,
          callbackURL: `${window.location.origin}/payment/nagad-callback`,
        })
        clearCart()
        window.location.href = ngData.callBackUrl
        return
      }

      // COD — done
      setPlacedOrderId(orderId)
      setSuccess(true)
      clearCart()
    } catch (e) {
      setError(e?.response?.data?.message ?? 'Unable to place your order. Please try again.')
    }
    setLoading(false)
  }

  return (
    <AnimatePresence>
      {isCheckoutOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/70" onClick={closeCheckout} />
          <motion.aside
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
            className="fixed right-0 top-0 z-[90] flex h-full w-full flex-col border-l border-white/10 bg-midnight sm:max-w-lg"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-white">Checkout</h2>
                <div className="mt-2 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-white/50">
                  {['Delivery Info', 'Payment & Review'].map((s, i) => (
                    <span key={s} className={`flex items-center gap-1.5 ${step === i + 1 ? 'text-glow-magenta' : ''}`}>
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${step === i + 1 ? 'bg-glow-magenta text-white' : step > i + 1 ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/50'}`}>
                        {step > i + 1 ? '✓' : i + 1}
                      </span>
                      {s}
                      {i === 0 && <span className="text-white/20">›</span>}
                    </span>
                  ))}
                </div>
              </div>
              <button type="button" onClick={closeCheckout} className="rounded-full p-2 text-white/70 hover:bg-white/5 hover:text-white" aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {success ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                    <CheckCircle2 size={80} className="text-emerald-400" />
                  </motion.div>
                  <h3 className="mt-6 font-heading text-3xl font-bold text-white">Order Placed! 🎉</h3>
                  <p className="mt-3 text-white/70">Your order ID is <span className="font-semibold text-white">{placedOrderId}</span></p>
                  <p className="mt-1.5 text-sm text-white/55">Estimated delivery 2–5 business days.</p>
                  <Link to={`/orders/${placedOrderId}`} onClick={closeCheckout}
                    className="mt-8 rounded-full bg-glow-magenta px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.15em] text-white"
                    style={{ boxShadow: '0 0 28px rgba(213,16,110,0.4)' }}>
                    Track Order
                  </Link>
                </div>
              ) : step === 1 ? (
                <div className="space-y-5">
                  {['name', 'phone', 'address'].map(field => (
                    <label key={field} className="block space-y-2">
                      <span className="text-sm font-medium text-white/85 capitalize">
                        {field === 'phone' ? 'Mobile Number' : field === 'address' ? 'Full Address' : 'Full Name'}
                      </span>
                      {field === 'address' ? (
                        <textarea name={field} value={form[field]} onChange={handleChange} rows={4}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-glow-magenta resize-none" />
                      ) : (
                        <input name={field} value={form[field]} onChange={handleChange}
                          placeholder={field === 'phone' ? '01XXXXXXXXX' : ''}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-glow-magenta" />
                      )}
                    </label>
                  ))}
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-white/85">Location</span>
                    <select name="location" value={form.location} onChange={handleChange}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-glow-magenta">
                      <option value="inside_dhaka" className="bg-midnight">Inside Dhaka (৳60)</option>
                      <option value="outside_dhaka" className="bg-midnight">Outside Dhaka (৳120)</option>
                    </select>
                  </label>
                  {error && <p className="text-sm text-red-400">{error}</p>}
                  <button type="button" onClick={handleContinue}
                    className="w-full rounded-2xl bg-glow-magenta px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white"
                    style={{ boxShadow: '0 0 28px rgba(213,16,110,0.35)' }}>
                    Continue to Payment
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Order Summary */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h3 className="font-heading text-lg font-semibold text-white mb-3">Order Summary</h3>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {cartItems.map(item => (
                        <div key={item._id ?? item.id} className="flex items-center gap-3">
                          <img src={getImg(item.images?.[0] ?? item.image)} alt={item.name} className="h-12 w-12 rounded-xl object-cover shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{item.name}</p>
                            <p className="text-xs text-white/50">Qty {item.quantity}</p>
                          </div>
                          <span className="text-sm font-semibold text-white shrink-0">{fmt(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
                      <div className="flex justify-between text-white/70"><span>Subtotal</span><span>{fmt(cartTotal)}</span></div>
                      <div className="flex justify-between text-white/70"><span>Delivery</span><span>{fmt(deliveryFee)}</span></div>
                      {discount > 0 && (
                        <div className="flex justify-between text-emerald-400"><span>Coupon ({couponData.coupon.code})</span><span>-{fmt(discount)}</span></div>
                      )}
                      <div className="flex justify-between text-lg font-bold text-white"><span>Total</span><span>{fmt(grandTotal)}</span></div>
                    </div>
                  </div>

                  {/* Coupon code */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h3 className="font-heading text-base font-semibold text-white mb-3 flex items-center gap-2">
                      <Tag size={16} className="text-glow-magenta" /> Coupon Code
                    </h3>
                    {couponData ? (
                      <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                        <p className="text-sm text-emerald-300">
                          ✅ <strong>{couponData.coupon.code}</strong> — saved {fmt(discount)}!
                        </p>
                        <button type="button" onClick={removeCoupon} className="text-gray-400 hover:text-white">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Enter code"
                          className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-glow-magenta" />
                        <button type="button" onClick={applyCoupon} disabled={couponLoading}
                          className="rounded-2xl border border-glow-magenta/50 px-4 py-2.5 text-sm font-semibold text-glow-magenta transition hover:bg-glow-magenta hover:text-white disabled:opacity-50">
                          {couponLoading ? '...' : 'Apply'}
                        </button>
                      </div>
                    )}
                    {couponError && <p className="mt-2 text-xs text-red-400">{couponError}</p>}
                  </div>

                  {/* Payment methods */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h3 className="font-heading text-base font-semibold text-white mb-3">Payment Method</h3>
                    <div className="space-y-2">
                      {([
                        { key: 'cod', label: 'Cash on Delivery', sub: 'Pay when delivered', enabled: true, emoji: '💵' },
                        { key: 'bkash', label: 'bKash', sub: 'Secure mobile payment', enabled: gateways.bkash?.enabled, emoji: '💙' },
                        { key: 'nagad', label: 'Nagad', sub: 'Digital payment', enabled: gateways.nagad?.enabled, emoji: '🟠' },
                      ]).map(pm => (
                        <label key={pm.key}
                          className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3.5 transition ${!pm.enabled ? 'cursor-not-allowed border-white/5 opacity-40' : form.paymentMethod === pm.key ? 'border-glow-magenta/40 bg-glow-magenta/10' : 'border-white/10 hover:border-white/20'}`}>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{pm.emoji}</span>
                            <div>
                              <p className="font-medium text-white">{pm.label}</p>
                              <p className="text-xs text-white/50">{pm.enabled ? pm.sub : 'Not available'}</p>
                            </div>
                          </div>
                          <input type="radio" name="paymentMethod" value={pm.key} checked={form.paymentMethod === pm.key}
                            onChange={handleChange} disabled={!pm.enabled} className="accent-glow-magenta" />
                        </label>
                      ))}
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-400">{error}</p>}

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(1)}
                      className="flex-1 rounded-2xl border border-white/10 px-5 py-4 text-sm font-semibold uppercase text-white/85 transition hover:bg-white/5">
                      Back
                    </button>
                    <button type="button" onClick={handlePlaceOrder} disabled={loading}
                      className="flex-1 rounded-2xl bg-glow-magenta px-5 py-4 text-sm font-semibold uppercase text-white disabled:opacity-70"
                      style={{ boxShadow: '0 0 28px rgba(213,16,110,0.35)' }}>
                      {loading ? 'Processing...' : form.paymentMethod === 'cod' ? 'Place Order' : `Pay with ${form.paymentMethod === 'bkash' ? 'bKash' : 'Nagad'}`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
