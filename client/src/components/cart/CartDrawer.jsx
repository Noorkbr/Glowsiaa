import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, ShoppingBag, Trash2, X, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

const formatCurrency = (value) => `৳${Number(value || 0).toLocaleString('en-BD')}`
const getItemId = (item) => item?._id ?? item?.id
const getImageUrl = (image) => {
  if (!image) return 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80'
  if (typeof image === 'string') return image
  return image.url || image.secure_url || image.src || image.path || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80'
}

const itemVariants = {
  hidden: { opacity: 0, x: 24, scale: 0.97 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 26 } },
  exit: { opacity: 0, x: -24, scale: 0.95, transition: { duration: 0.22 } },
}

export default function CartDrawer() {
  const navigate = useNavigate()
  const { items, isDrawerOpen, closeDrawer, cartCount, cartTotal, updateQuantity, removeFromCart, openCheckout } = useCart()

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
            onClick={closeDrawer}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="fixed right-0 top-0 z-[80] flex h-full w-full flex-col overflow-hidden border-l border-white/10 bg-midnight/95 shadow-2xl backdrop-blur-2xl sm:max-w-md"
          >
            {/* Ambient glow */}
            <div className="pointer-events-none absolute -top-20 right-0 h-64 w-64 rounded-full bg-glow-magenta/10 blur-3xl" />

            {/* Header */}
            <div className="relative flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-glow-magenta/15">
                  <ShoppingBag size={18} className="text-glow-magenta" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-white">Your Cart</h2>
                  <p className="text-xs text-white/45">{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <motion.button
                type="button"
                onClick={closeDrawer}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="rounded-full border border-white/10 p-2 text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* Content */}
            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.1 }}
                  className="rounded-3xl border border-white/10 bg-white/5 p-7"
                >
                  <ShoppingBag size={52} className="text-glow-magenta" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 font-heading text-2xl font-bold text-white"
                >
                  Cart is empty
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="mt-2 text-sm text-white/55"
                >
                  Discover your next glow-up essential
                </motion.p>
                <motion.button
                  type="button"
                  onClick={() => { closeDrawer(); navigate('/products') }}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-glow-magenta px-7 py-3.5 text-sm font-semibold text-white"
                  style={{ boxShadow: '0 0 28px rgba(213,16,110,0.4)' }}
                >
                  Start Shopping <ArrowRight size={15} />
                </motion.button>
              </div>
            ) : (
              <>
                {/* Items list */}
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  <motion.div className="space-y-3" layout>
                    <AnimatePresence mode="popLayout">
                      {items.map((item) => {
                        const itemId = getItemId(item)
                        return (
                          <motion.div
                            key={itemId}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            layout
                            className="group flex gap-3 rounded-2xl border border-white/8 bg-white/[0.04] p-3.5 transition hover:border-white/15"
                          >
                            {/* Image */}
                            <div className="relative h-18 w-18 overflow-hidden rounded-xl shrink-0">
                              <img
                                src={getImageUrl(item?.images?.[0] ?? item?.image)}
                                alt={item?.name}
                                className="h-[68px] w-[68px] rounded-xl object-cover transition duration-300 group-hover:scale-105"
                              />
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white">
                                    {item?.name}
                                  </h3>
                                  <p className="mt-0.5 text-xs font-bold text-glow-magenta">
                                    {formatCurrency(item?.price)}
                                  </p>
                                </div>
                                <motion.button
                                  type="button"
                                  onClick={() => removeFromCart(itemId)}
                                  whileHover={{ scale: 1.15 }}
                                  whileTap={{ scale: 0.85 }}
                                  className="shrink-0 rounded-lg p-1.5 text-white/30 transition hover:bg-red-500/10 hover:text-red-400"
                                >
                                  <Trash2 size={14} />
                                </motion.button>
                              </div>

                              {/* Qty + subtotal */}
                              <div className="mt-3 flex items-center justify-between">
                                <div className="inline-flex items-center rounded-xl border border-white/10 bg-black/20 px-1 py-0.5">
                                  <motion.button
                                    type="button"
                                    onClick={() => updateQuantity(itemId, item.quantity - 1)}
                                    whileTap={{ scale: 0.85 }}
                                    className="rounded-lg p-1.5 text-white/60 hover:text-white"
                                  >
                                    <Minus size={12} />
                                  </motion.button>
                                  <span className="min-w-[2rem] text-center text-sm font-bold text-white">
                                    {item.quantity}
                                  </span>
                                  <motion.button
                                    type="button"
                                    onClick={() => updateQuantity(itemId, item.quantity + 1)}
                                    whileTap={{ scale: 0.85 }}
                                    className="rounded-lg p-1.5 text-white/60 hover:text-white"
                                  >
                                    <Plus size={12} />
                                  </motion.button>
                                </div>
                                <span className="text-sm font-bold text-white">
                                  {formatCurrency(Number(item?.price || 0) * item.quantity)}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Footer */}
                <div className="border-t border-white/10 bg-midnight/80 px-5 py-5 backdrop-blur-xl">
                  {/* Subtotal */}
                  <div className="mb-1 flex items-center justify-between text-sm text-white/60">
                    <span>Subtotal ({cartCount} items)</span>
                    <motion.span
                      key={cartTotal}
                      initial={{ scale: 1.15, color: '#D5106E' }}
                      animate={{ scale: 1, color: '#ffffff' }}
                      transition={{ duration: 0.35 }}
                      className="text-base font-bold"
                    >
                      {formatCurrency(cartTotal)}
                    </motion.span>
                  </div>
                  <p className="mb-4 text-xs text-white/35">
                    Delivery calculated at checkout
                  </p>

                  <motion.button
                    type="button"
                    onClick={() => { openCheckout(); closeDrawer() }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full rounded-2xl bg-glow-magenta py-4 text-sm font-bold uppercase tracking-[0.18em] text-white"
                    style={{ boxShadow: '0 0 32px rgba(213,16,110,0.4)' }}
                  >
                    Proceed to Checkout
                  </motion.button>

                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="mt-2.5 w-full rounded-2xl py-3 text-sm text-white/45 transition hover:text-white/70"
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
