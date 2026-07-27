import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

const formatCurrency = (value) => `৳${Number(value || 0).toLocaleString('en-BD')}`
const getItemId = (item) => item?._id ?? item?.id
const getImageUrl = (image) => {
  if (!image) return 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80'
  if (typeof image === 'string') return image
  return image.url || image.secure_url || image.src || image.path || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80'
}

export default function CartDrawer() {
  const navigate = useNavigate()
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    cartCount,
    cartTotal,
    updateQuantity,
    removeFromCart,
    openCheckout
  } = useCart()

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60"
            onClick={closeDrawer}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 240, damping: 28 }}
            className="fixed right-0 top-0 z-[80] flex h-full w-full max-w-md flex-col border-l border-white/10 bg-midnight"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <h2 className="font-heading text-2xl font-semibold text-white">Your Cart ({cartCount} items)</h2>
              <button type="button" onClick={closeDrawer} className="rounded-full p-2 text-white/70 transition hover:bg-white/5 hover:text-white" aria-label="Close cart">
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <div className="rounded-full border border-white/10 bg-white/5 p-6 text-glow-magenta">
                  <ShoppingBag size={48} />
                </div>
                <h3 className="mt-6 font-heading text-2xl font-semibold text-white">Your cart is empty</h3>
                <p className="mt-3 text-white/60">Discover bestselling beauty essentials and build your perfect glow routine.</p>
                <button
                  type="button"
                  onClick={() => {
                    closeDrawer()
                    navigate('/products')
                  }}
                  className="mt-8 rounded-full bg-glow-magenta px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                  {items.map((item) => {
                    const itemId = getItemId(item)
                    return (
                      <div key={itemId} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <img src={getImageUrl(item?.images?.[0] ?? item?.image)} alt={item?.name} className="h-[60px] w-[60px] rounded-lg object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="line-clamp-2 font-medium text-white">{item?.name}</h3>
                              <p className="mt-1 text-sm text-white/60">{formatCurrency(item?.price)}</p>
                            </div>
                            <button type="button" onClick={() => removeFromCart(itemId)} className="text-white/45 transition hover:text-red-400" aria-label="Remove item">
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <div className="mt-4 inline-flex items-center rounded-full border border-white/10 bg-[#12121c] px-2 py-1">
                            <button type="button" onClick={() => updateQuantity(itemId, item.quantity - 1)} className="rounded-full p-1 text-white/75 transition hover:bg-white/5 hover:text-white" aria-label="Decrease quantity">
                              <Minus size={14} />
                            </button>
                            <span className="min-w-[2rem] text-center text-sm font-semibold text-white">{item.quantity}</span>
                            <button type="button" onClick={() => updateQuantity(itemId, item.quantity + 1)} className="rounded-full p-1 text-white/75 transition hover:bg-white/5 hover:text-white" aria-label="Increase quantity">
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-white/10 px-6 py-6">
                  <div className="mb-5 flex items-center justify-between text-base text-white/75">
                    <span>Subtotal</span>
                    <span className="font-semibold text-white">{formatCurrency(cartTotal)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      openCheckout()
                      closeDrawer()
                    }}
                    className="w-full rounded-2xl bg-glow-magenta px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white"
                    style={{ boxShadow: '0 0 28px rgba(213, 16, 110, 0.35)' }}
                  >
                    Proceed to Checkout
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
