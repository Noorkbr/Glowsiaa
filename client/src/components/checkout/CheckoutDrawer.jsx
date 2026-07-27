import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useCart } from '../../context/CartContext'

const formatCurrency = (value) => `৳${Number(value || 0).toLocaleString('en-BD')}`
const phoneRegex = /^01[0-9]{9}$/
const getImageUrl = (image) => {
  if (!image) return 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80'
  if (typeof image === 'string') return image
  return image.url || image.secure_url || image.src || image.path || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80'
}

const initialFormData = {
  name: '',
  phone: '',
  address: '',
  location: 'Inside Dhaka (৳60)',
  paymentMethod: 'cod'
}

export default function CheckoutDrawer() {
  const {
    items: cartItems,
    cartTotal,
    isCheckoutOpen,
    closeCheckout,
    clearCart
  } = useCart()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState(initialFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [placedOrderId, setPlacedOrderId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isCheckoutOpen) {
      setStep(1)
      setIsLoading(false)
      setOrderSuccess(false)
      setPlacedOrderId('')
      setError('')
      setFormData(initialFormData)
    }
  }, [isCheckoutOpen])

  const deliveryFee = useMemo(
    () => (formData.location === 'Outside Dhaka (৳120)' ? 120 : 60),
    [formData.location]
  )

  const grandTotal = cartTotal + deliveryFee

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleContinue = () => {
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim() || !formData.location) {
      setError('Please complete all required delivery details.')
      return
    }
    if (!phoneRegex.test(formData.phone.trim())) {
      setError('Please enter a valid Bangladeshi mobile number.')
      return
    }
    setError('')
    setStep(2)
  }

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const payload = {
        customer: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          location: formData.location
        },
        items: cartItems.map((item) => ({
          product: item?._id ?? item?.id,
          name: item?.name,
          price: item?.price,
          quantity: item?.quantity,
          image: getImageUrl(item?.images?.[0] ?? item?.image)
        })),
        paymentMethod: 'cod'
      }

      const { data } = await api.post('/orders', payload)
      const orderId = data?.order?._id ?? data?._id ?? data?.orderId ?? 'Pending Confirmation'
      setPlacedOrderId(orderId)
      setOrderSuccess(true)
      clearCart()
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? 'Unable to place your order right now. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isCheckoutOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/70"
            onClick={closeCheckout}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
            className="fixed right-0 top-0 z-[90] flex h-full w-full max-w-lg flex-col border-l border-white/10 bg-midnight"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-white">Checkout</h2>
                <div className="mt-3 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-white/50">
                  <span className={step === 1 ? 'text-glow-magenta' : ''}>Step 1 Delivery Info</span>
                  <span>•</span>
                  <span className={step === 2 ? 'text-glow-magenta' : ''}>Step 2 Payment & Review</span>
                </div>
              </div>
              <button type="button" onClick={closeCheckout} className="rounded-full p-2 text-white/70 transition hover:bg-white/5 hover:text-white" aria-label="Close checkout">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {orderSuccess ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <CheckCircle2 size={64} className="text-green-400" />
                  <h3 className="mt-6 font-heading text-3xl font-bold text-white">✅ Order Placed!</h3>
                  <p className="mt-3 text-white/70">Your order ID is <span className="font-semibold text-white">{placedOrderId}</span>.</p>
                  <p className="mt-2 text-white/60">Estimated delivery 2-5 business days.</p>
                  <Link to={`/orders/${placedOrderId}`} onClick={closeCheckout} className="mt-8 rounded-full bg-glow-magenta px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white">
                    Track Order
                  </Link>
                </div>
              ) : step === 1 ? (
                <div className="space-y-5">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-white/85">Full Name</span>
                    <input name="name" value={formData.name} onChange={handleChange} required className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-glow-magenta" />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-white/85">Mobile Number</span>
                    <input name="phone" value={formData.phone} onChange={handleChange} required placeholder="01XXXXXXXXX" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-glow-magenta" />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-white/85">Full Address</span>
                    <textarea name="address" value={formData.address} onChange={handleChange} required rows="5" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-glow-magenta" />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-white/85">Location</span>
                    <select name="location" value={formData.location} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-glow-magenta">
                      <option className="bg-midnight">Inside Dhaka (৳60)</option>
                      <option className="bg-midnight">Outside Dhaka (৳120)</option>
                    </select>
                  </label>
                  {error && <p className="text-sm text-red-400">{error}</p>}
                  <button type="button" onClick={handleContinue} className="w-full rounded-2xl bg-glow-magenta px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white" style={{ boxShadow: '0 0 28px rgba(213, 16, 110, 0.35)' }}>
                    Continue
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <h3 className="font-heading text-xl font-semibold text-white">Order Summary</h3>
                    <div className="mt-4 space-y-4">
                      {cartItems.map((item) => (
                        <div key={item?._id ?? item?.id} className="flex items-center gap-4">
                          <img src={getImageUrl(item?.images?.[0] ?? item?.image)} alt={item?.name} className="h-16 w-16 rounded-xl object-cover" />
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{item?.name}</h4>
                            <p className="text-sm text-white/55">Qty {item?.quantity}</p>
                          </div>
                          <span className="font-semibold text-white">{formatCurrency(Number(item?.price || 0) * Number(item?.quantity || 0))}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">
                      <div className="flex items-center justify-between text-white/70"><span>Subtotal</span><span>{formatCurrency(cartTotal)}</span></div>
                      <div className="flex items-center justify-between text-white/70"><span>Delivery Fee</span><span>{formatCurrency(deliveryFee)}</span></div>
                      <div className="flex items-center justify-between text-lg font-bold text-white"><span>Total</span><span>{formatCurrency(grandTotal)}</span></div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <h3 className="font-heading text-xl font-semibold text-white">Payment Method</h3>
                    <div className="mt-4 space-y-3">
                      <label className="flex items-center justify-between rounded-2xl border border-glow-magenta/40 bg-glow-magenta/10 px-4 py-4 text-white">
                        <span>Cash on Delivery (COD)</span>
                        <input type="radio" name="paymentMethod" checked readOnly className="accent-glow-magenta" />
                      </label>
                      <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-white/40">
                        <span>bKash</span>
                        <span className="text-xs uppercase tracking-[0.2em]">Coming Soon</span>
                      </label>
                      <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-white/40">
                        <span>Nagad</span>
                        <span className="text-xs uppercase tracking-[0.2em]">Coming Soon</span>
                      </label>
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-400">{error}</p>}
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 rounded-2xl border border-white/10 px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white/85 transition hover:bg-white/5">
                      Back
                    </button>
                    <button type="button" onClick={handlePlaceOrder} disabled={isLoading} className="flex-1 rounded-2xl bg-glow-magenta px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-70" style={{ boxShadow: '0 0 28px rgba(213, 16, 110, 0.35)' }}>
                      {isLoading ? 'Placing Order...' : 'Place Order'}
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
