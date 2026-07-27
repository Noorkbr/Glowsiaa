import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Heart, ShoppingBag, Star } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'

const formatCurrency = (value) => `৳${Number(value || 0).toLocaleString('en-BD')}`

const getImageUrl = (image) => {
  if (!image) return 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80'
  if (typeof image === 'string') return image
  return image.url || image.secure_url || image.src || image.path || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80'
}

function RatingStars({ rating = 0 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.max(0, Math.min(1, rating - star + 1)) * 100
        return (
          <div key={star} className="relative h-3.5 w-3.5">
            <Star className="absolute inset-0 h-3.5 w-3.5 text-white/20" />
            <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill}%` }}>
              <Star className="h-3.5 w-3.5 text-[#F4C542]" fill="#F4C542" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const { addToCart, openDrawer } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const [hoverImage, setHoverImage] = useState(false)
  const ref = useRef(null)

  // 3D tilt physics
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 24 })
  const springY = useSpring(y, { stiffness: 200, damping: 24 })
  const rotateX = useTransform(springY, [-0.5, 0.5], ['8deg', '-8deg'])
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-8deg', '8deg'])
  const glowX = useTransform(springX, [-0.5, 0.5], ['0%', '100%'])
  const glowY = useTransform(springY, [-0.5, 0.5], ['0%', '100%'])

  const handleMouseMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  const handleMouseLeave = () => { x.set(0); y.set(0) }

  const images = useMemo(() => {
    const list = Array.isArray(product?.images) && product.images.length > 0 ? product.images : [product?.image]
    return list.map(getImageUrl)
  }, [product])

  const price = Number(product?.price || 0)
  const comparePrice = Number(product?.comparePrice ?? product?.originalPrice ?? price)
  const discount = Number(product?.discount || (comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0))
  const rating = Number(product?.rating ?? 4.7)
  const reviewCount = Number(product?.reviewCount ?? 0)
  const productId = product?._id ?? product?.id
  const wishlisted = isWishlisted(productId)

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addToCart(product, 1)
    openDrawer()
  }

  const handleWishlist = (e) => {
    e.stopPropagation()
    toggleWishlist(product)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => navigate(`/product/${productId}`)}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-shadow"
    >
      {/* Dynamic spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${glowX} ${glowY}, rgba(213,16,110,0.12) 0%, transparent 60%)`,
        }}
      />

      {/* Image */}
      <div
        className="relative h-72 overflow-hidden"
        onMouseEnter={() => setHoverImage(true)}
        onMouseLeave={() => setHoverImage(false)}
      >
        {images[0] && (
          <motion.img
            src={images[0]}
            alt={product?.name}
            animate={{ scale: hoverImage ? 1.07 : 1.0, opacity: hoverImage && images[1] ? 0 : 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {images[1] && (
          <motion.img
            src={images[1]}
            alt={product?.name}
            animate={{ scale: hoverImage ? 1.07 : 1.0, opacity: hoverImage ? 1 : 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Badges */}
        {product?.badge && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-midnight"
          >
            {product.badge}
          </motion.span>
        )}
        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-glow-magenta px-2.5 py-1 text-[10px] font-bold text-white">
            -{discount}%
          </span>
        )}

        {/* Wishlist button */}
        <motion.button
          type="button"
          onClick={handleWishlist}
          whileTap={{ scale: 0.85 }}
          className={`absolute bottom-3 right-3 rounded-full border p-2 backdrop-blur-sm transition ${
            wishlisted
              ? 'border-glow-magenta/60 bg-glow-magenta/20 text-glow-magenta'
              : 'border-white/25 bg-black/25 text-white/70 opacity-0 group-hover:opacity-100 hover:border-glow-magenta/50 hover:text-glow-magenta'
          }`}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={15} fill={wishlisted ? 'currentColor' : 'none'} />
        </motion.button>

        {/* Quick add overlay on hover */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: hoverImage ? 1 : 0, y: hoverImage ? 0 : 10 }}
          transition={{ duration: 0.25 }}
          className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-4"
        >
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex items-center gap-2 rounded-full bg-glow-magenta px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-lg transition hover:scale-105"
            style={{ boxShadow: '0 8px 24px rgba(213,16,110,0.45)' }}
          >
            <ShoppingBag size={13} />
            Quick Add
          </button>
        </motion.div>
      </div>

      {/* Content */}
      <div className="space-y-3 p-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-glow-magenta">{product?.category}</p>
          <h3 className="mt-1 line-clamp-2 font-heading text-lg font-semibold text-white">{product?.name}</h3>
          <div className="mt-2 flex items-center gap-2">
            <RatingStars rating={rating} />
            <span className="text-xs text-white/50">({reviewCount})</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-end gap-2">
            <span className="text-xl font-bold text-white">{formatCurrency(price)}</span>
            {comparePrice !== price && comparePrice > 0 && (
              <span className="text-sm text-white/35 line-through">{formatCurrency(comparePrice)}</span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full rounded-xl bg-glow-magenta py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 hover:opacity-90"
          style={{ boxShadow: '0 0 20px rgba(213, 16, 110, 0.30)' }}
        >
          Add to Cart
        </button>
      </div>
    </motion.div>
  )
}
