import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

const formatCurrency = (value) => `৳${Number(value || 0).toLocaleString('en-BD')}`

const getImageUrl = (image) => {
  if (!image) return 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80'
  if (typeof image === 'string') return image
  return image.url || image.secure_url || image.src || image.path || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80'
}

function RatingStars({ rating = 0 }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPercent = Math.max(0, Math.min(1, rating - star + 1)) * 100
        return (
          <div key={star} className="relative h-4 w-4">
            <Star className="absolute inset-0 h-4 w-4 text-white/20" />
            <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
              <Star className="h-4 w-4 text-[#F4C542]" fill="#F4C542" />
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
  const [currentImage, setCurrentImage] = useState(0)

  const images = useMemo(() => {
    const productImages = Array.isArray(product?.images) && product.images.length > 0 ? product.images : [product?.image]
    return productImages.map(getImageUrl)
  }, [product])

  const price = Number(product?.price || 0)
  const comparePrice = Number(product?.comparePrice ?? product?.originalPrice ?? price)
  const discount = Number(product?.discount || (comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0))
  const rating = Number(product?.rating ?? 4.7)
  const reviewCount = Number(product?.reviewCount ?? product?.reviews?.length ?? 0)

  const handleAddToCart = (event) => {
    event.stopPropagation()
    addToCart(product, 1)
    openDrawer()
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/product/${product?._id ?? product?.id}`)}
      onMouseEnter={() => setCurrentImage(images[1] ? 1 : 0)}
      onMouseLeave={() => setCurrentImage(0)}
      className="cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5"
    >
      <div className="relative h-72 overflow-hidden">
        <img
          src={images[0]}
          alt={product?.name}
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ${currentImage === 0 ? 'scale-105 opacity-100' : 'scale-100 opacity-0'}`}
        />
        <img
          src={images[1] || images[0]}
          alt={product?.name}
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ${currentImage === 1 ? 'scale-105 opacity-100' : 'scale-100 opacity-0'}`}
        />
        {product?.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-midnight">
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute right-4 top-4 rounded-full bg-glow-magenta px-3 py-1 text-xs font-semibold text-white">
            -{discount}%
          </span>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h3 className="line-clamp-2 font-heading text-xl font-semibold text-white">{product?.name}</h3>
          <div className="mt-3 flex items-center gap-2">
            <RatingStars rating={rating} />
            <span className="text-sm text-white/55">({reviewCount})</span>
          </div>
        </div>

        <div className="flex items-end gap-3">
          <span className="text-xl font-bold text-white">{formatCurrency(price)}</span>
          {comparePrice !== price && comparePrice > 0 && (
            <span className="text-sm text-white/40 line-through">{formatCurrency(comparePrice)}</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full rounded-xl bg-glow-magenta py-2 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5"
          style={{ boxShadow: '0 0 24px rgba(213, 16, 110, 0.35)' }}
        >
          Add to Cart
        </button>
      </div>
    </motion.div>
  )
}
