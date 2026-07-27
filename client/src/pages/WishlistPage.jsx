import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import CartDrawer from '../components/cart/CartDrawer'
import CheckoutDrawer from '../components/checkout/CheckoutDrawer'
import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

const getImageUrl = (image) => {
  if (!image) return 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80'
  if (typeof image === 'string') return image
  return image.url || image.secure_url || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80'
}

export default function WishlistPage() {
  const navigate = useNavigate()
  const { items, removeFromWishlist, wishlistCount } = useWishlist()
  const { addToCart, openDrawer } = useCart()

  const handleAddToCart = (product) => {
    addToCart(product, 1)
    openDrawer()
  }

  return (
    <div className="min-h-screen bg-midnight text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.28em] text-glow-magenta">Your saved items</p>
          <h1 className="mt-3 font-heading text-4xl font-bold text-white">
            Wishlist <span className="text-white/40">({wishlistCount})</span>
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 py-24 text-center">
            <div className="rounded-full border border-white/10 bg-white/5 p-6 text-glow-magenta">
              <Heart size={48} />
            </div>
            <h2 className="mt-6 font-heading text-2xl font-semibold text-white">Your wishlist is empty</h2>
            <p className="mt-3 max-w-sm text-white/55">
              Save your favourite beauty essentials and find them here whenever you&apos;re ready.
            </p>
            <Link
              to="/products"
              className="mt-8 rounded-full bg-glow-magenta px-8 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5"
              style={{ boxShadow: '0 0 28px rgba(213,16,110,0.35)' }}
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((product) => {
              const productId = product?._id ?? product?.id
              const price = Number(product?.price || 0)
              const comparePrice = Number(product?.comparePrice || price)

              return (
                <motion.div
                  key={productId}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                >
                  <div
                    className="relative h-64 cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/product/${productId}`)}
                  >
                    <img
                      src={getImageUrl(product?.images?.[0] ?? product?.image)}
                      alt={product?.name}
                      className="h-full w-full object-cover transition duration-300 hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFromWishlist(productId) }}
                      className="absolute right-3 top-3 rounded-full border border-red-500/30 bg-black/40 p-2 text-red-400 transition hover:bg-red-500/20"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3
                      className="line-clamp-2 cursor-pointer font-heading text-lg font-semibold text-white hover:text-glow-magenta transition"
                      onClick={() => navigate(`/product/${productId}`)}
                    >
                      {product?.name}
                    </h3>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-lg font-bold text-white">৳{price.toLocaleString('en-BD')}</span>
                      {comparePrice > price && (
                        <span className="text-sm text-white/35 line-through">৳{comparePrice.toLocaleString('en-BD')}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-glow-magenta py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                      style={{ boxShadow: '0 0 20px rgba(213,16,110,0.3)' }}
                    >
                      <ShoppingBag size={15} />
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
      <CartDrawer />
      <CheckoutDrawer />
    </div>
  )
}

