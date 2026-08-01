import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Heart, ShoppingBag, Star, Zap } from 'lucide-react'
import { useMemo, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'

const fmt = (v) => `৳${Number(v || 0).toLocaleString('en-BD')}`

const getImg = (img) => {
  if (!img) return 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80'
  if (typeof img === 'string') return img
  return img.url || img.secure_url || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80'
}

function Stars({ rating = 0 }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => {
        const fill = Math.max(0, Math.min(1, rating - s + 1)) * 100
        return (
          <div key={s} className="relative h-3.5 w-3.5">
            <Star className="absolute h-3.5 w-3.5 text-white/15" />
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
  const navigate  = useNavigate()
  const { addToCart, openDrawer } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const ref = useRef(null)
  const rafId = useRef(null)
  const [hover, setHover] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)

  // 3D Tilt
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const smx = useSpring(mx, { stiffness: 180, damping: 22, mass: 0.5 })
  const smy = useSpring(my, { stiffness: 180, damping: 22, mass: 0.5 })
  const rotateX = useTransform(smy, [-0.5, 0.5], ['10deg', '-10deg'])
  const rotateY = useTransform(smx, [-0.5, 0.5], ['-10deg', '10deg'])

  // Spotlight glow position
  const glowX = useTransform(smx, [-0.5, 0.5], ['0%', '100%'])
  const glowY = useTransform(smy, [-0.5, 0.5], ['0%', '100%'])

  const onMouseMove = useCallback((e) => {
    if (rafId.current) return
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null
      if (!ref.current) return
      const r = ref.current.getBoundingClientRect()
      mx.set((e.clientX - r.left) / r.width  - 0.5)
      my.set((e.clientY - r.top)  / r.height - 0.5)
    })
  }, [mx, my])

  const onMouseLeave = useCallback(() => {
    if (rafId.current) { cancelAnimationFrame(rafId.current); rafId.current = null }
    mx.set(0); my.set(0)
    setHover(false); setImgIdx(0)
  }, [mx, my])

  const onMouseEnter = useCallback(() => {
    setHover(true)
    setImgIdx(1)
  }, [])

  const images = useMemo(() => {
    const list = Array.isArray(product?.images) && product.images.length > 0 ? product.images : [product?.image]
    return list.map(getImg)
  }, [product])

  const price        = Number(product?.price || 0)
  const comparePrice = Number(product?.comparePrice ?? price)
  const discount     = Number(product?.discount || (comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0))
  const rating       = Number(product?.rating ?? 4.7)
  const reviews      = Number(product?.reviewCount ?? 0)
  const pid          = product?._id ?? product?.id
  const wishlisted   = isWishlisted(pid)

  const handleAdd = (e) => { e.stopPropagation(); addToCart(product, 1); openDrawer() }
  const handleWish= (e) => { e.stopPropagation(); toggleWishlist(product) }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
      onClick={() => navigate(`/product/${pid}`)}
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: 0.97 }}
      className="group relative cursor-none overflow-hidden rounded-3xl"
      style={{
        rotateX, rotateY,
        transformStyle: 'preserve-3d',
        background: 'rgba(255,255,255,0.025)',
        border: hover ? '1px solid rgba(213,16,110,0.4)' : '1px solid rgba(255,255,255,0.07)',
        boxShadow: hover
          ? '0 0 0 1px rgba(213,16,110,0.35), 0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(213,16,110,0.15)'
          : '0 4px 24px rgba(0,0,0,0.5)',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      {/* Spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-10 rounded-3xl opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${glowX} ${glowY}, rgba(213,16,110,0.14) 0%, transparent 55%)`,
        }}
      />

      {/* Image section */}
      <div className="relative h-72 overflow-hidden rounded-t-3xl">
        {/* Primary image */}
        <motion.img src={images[0]} alt={product?.name}
          animate={{ scale: hover ? 1.08 : 1.0, opacity: hover && images[1] ? 0 : 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 h-full w-full object-cover" />
        {/* Secondary image crossfade */}
        {images[1] && (
          <motion.img src={images[1]} alt={product?.name}
            animate={{ scale: hover ? 1.08 : 1.0, opacity: hover ? 1 : 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badges */}
        {product?.badge && (
          <span className="absolute left-3.5 top-3.5 z-20 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-midnight">
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute right-3.5 top-3.5 z-20 rounded-full bg-glow-magenta px-2.5 py-1 text-[10px] font-bold text-white"
            style={{ boxShadow: '0 0 12px rgba(213,16,110,0.6)' }}>
            -{discount}%
          </span>
        )}

        {/* Wishlist */}
        <motion.button type="button" onClick={handleWish} whileTap={{ scale: 0.8 }}
          className={`absolute bottom-3.5 right-3.5 z-20 rounded-full border p-2 backdrop-blur-md transition ${
            wishlisted ? 'border-glow-magenta/60 bg-glow-magenta/25 text-glow-magenta' : 'border-white/20 bg-black/30 text-white/60 opacity-0 group-hover:opacity-100'
          }`}>
          <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
        </motion.button>

        {/* Quick Add CTA — slides up from bottom */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={hover ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="absolute bottom-0 left-0 right-0 z-20 flex justify-center pb-4">
          <motion.button type="button" onClick={handleAdd}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            className="btn-shimmer flex items-center gap-2 rounded-full bg-glow-magenta px-6 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white"
            style={{ boxShadow: '0 8px 28px rgba(213,16,110,0.55)' }}>
            <Zap size={12} />
            Quick Add
          </motion.button>
        </motion.div>
      </div>

      {/* Content */}
      <div className="space-y-3 p-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-glow-magenta">{product?.category}</p>
          <h3 className="mt-1 line-clamp-2 font-heading text-[1.05rem] font-semibold leading-snug text-white">{product?.name}</h3>
          <div className="mt-2 flex items-center gap-2">
            <Stars rating={rating} />
            <span className="text-xs text-white/40">({reviews})</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-end gap-2">
            <span className="text-xl font-black text-white">{fmt(price)}</span>
            {comparePrice !== price && comparePrice > 0 && (
              <span className="text-sm text-white/30 line-through">{fmt(comparePrice)}</span>
            )}
          </div>
        </div>
        <motion.button type="button" onClick={handleAdd}
          whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-glow-magenta py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white"
          style={{ boxShadow: '0 0 20px rgba(213,16,110,0.3)' }}>
          <ShoppingBag size={13} />
          Add to Cart
        </motion.button>
      </div>
    </motion.div>
  )
}
