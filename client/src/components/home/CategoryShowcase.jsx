import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useRealtime } from '../../context/RealtimeContext'

// ── Sky gradient presets ──────────────────────────────────────────────────────
const SKY_GRADIENTS = [
  'linear-gradient(160deg, #E0F4FF 0%, #BAE3FF 40%, #93D0FF 100%)',
  'linear-gradient(160deg, #E8F8F0 0%, #B8EDD4 40%, #7DDDB0 100%)',
  'linear-gradient(160deg, #FFF0E8 0%, #FFD6BB 40%, #FFBA90 100%)',
  'linear-gradient(160deg, #F4E8FF 0%, #DCBFFF 40%, #C49AFF 100%)',
  'linear-gradient(160deg, #FFEEF4 0%, #FFD0E4 40%, #FFB0CE 100%)',
  'linear-gradient(160deg, #EEFBFF 0%, #C8F0FF 40%, #A0E4FF 100%)',
]

const TEXT_COLORS = ['#1565C0', '#1B7A45', '#B84B00', '#6B21A8', '#BE185D', '#0369A1']

// Default categories shown when DB has none
const FALLBACK = [
  { slug: 'skincare',  name: 'Skincare',  emoji: '🧴', imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80' },
  { slug: 'makeup',    name: 'Makeup',    emoji: '💄', imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80' },
  { slug: 'fragrance', name: 'Fragrance', emoji: '🌸', imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80' },
  { slug: 'haircare',  name: 'Haircare',  emoji: '💆', imageUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&q=80' },
]

// ── Sparkle star ────────��────────────────────────────────────────────────────
const Star = ({ size = 12, x, y, delay = 0, color = 'rgba(100,149,237,0.9)' }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: x, top: y, width: size, height: size }}
    animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], rotate: [0, 180, 360] }}
    transition={{ duration: 2.5, repeat: Infinity, delay, ease: 'easeInOut' }}
  >
    <svg viewBox="0 0 24 24" width={size} height={size} style={{ fill: color }}>
      <path d="M12 2 L13.5 9 L20 10.5 L13.5 12 L12 19 L10.5 12 L4 10.5 L10.5 9 Z" />
    </svg>
  </motion.div>
)

// ── Single category card ──────────────────────────────────────────────────────
function CategoryCard({ name, slug, imageUrl, emoji, index }) {
  const gradient = SKY_GRADIENTS[index % SKY_GRADIENTS.length]
  const textColor = TEXT_COLORS[index % TEXT_COLORS.length]

  // Sparkle positions
  const sparkles = [
    { size: 14, x: '8%',  y: '10%', delay: 0 },
    { size: 9,  x: '82%', y: '7%',  delay: 0.6 },
    { size: 11, x: '88%', y: '72%', delay: 1.2 },
    { size: 8,  x: '5%',  y: '78%', delay: 0.9 },
    { size: 7,  x: '45%', y: '4%',  delay: 1.5 },
  ]

  return (
    <Link to={`/products?category=${slug}`}>
      <motion.div
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-none"
        style={{
          background: gradient,
          border: '2px solid rgba(255,255,255,0.7)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.06)',
          aspectRatio: '3/4',
        }}
        initial={{ opacity: 0, y: 28, scale: 0.93 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -6, boxShadow: '0 12px 40px rgba(0,0,0,0.14)' }}
      >
        {/* Sparkles */}
        {sparkles.map((s, i) => (
          <Star key={i} {...s} color={`${textColor}99`} />
        ))}

        {/* Product image */}
        {imageUrl ? (
          <motion.img
            src={imageUrl}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover object-top"
            style={{ opacity: 0.88 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.45 }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl sm:text-8xl opacity-30">
            {emoji}
          </div>
        )}

        {/* Bottom gradient + label */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-10 sm:px-4 sm:pb-4 sm:pt-12"
          style={{ background: `linear-gradient(to top, ${gradient.match(/#[A-F0-9]+/gi)?.[2] || '#93D0FF'}ee 0%, transparent 100%)` }}>
          <p className="font-heading text-sm sm:text-base font-bold" style={{ color: textColor }}>
            {emoji} {name}
          </p>
          <p className="text-xs font-medium mt-0.5" style={{ color: textColor, opacity: 0.7 }}>
            Shop Now →
          </p>
        </div>

        {/* Top shine */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
      </motion.div>
    </Link>
  )
}

// ── Main export ───────────────────────────────────────────────────────────��───
export default function CategoryShowcase() {
  const [categories, setCategories] = useState([])
  const categoriesKey = useRealtime('categories')

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => {
        const cats = data.categories || []
        const filtered = cats.filter(c => !c.parent && c.isActive)
        setCategories(filtered.length >= 2 ? filtered : FALLBACK)
      })
      .catch(() => setCategories(FALLBACK))
  }, [categoriesKey])

  return (
    <section className="px-3 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          className="mb-6 sm:mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-glow-magenta mb-2">Beauty Categories</p>
            <h2 className="font-heading text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
              Shop by{' '}
              <span className="text-gradient-static">Category</span>
            </h2>
          </div>
          <Link to="/products"
            className="text-sm font-semibold text-white/55 transition hover:text-white hidden sm:block">
            All Products →
          </Link>
        </motion.div>

        {/* Cards grid: 2 on mobile, 3 on sm, 4 on md, up to 6 on xl */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:gap-5 xl:grid-cols-5">
          {categories.slice(0, 10).map((cat, i) => (
            <CategoryCard
              key={cat._id || cat.slug}
              name={cat.name}
              slug={cat.slug}
              imageUrl={cat.imageUrl}
              emoji={cat.emoji || '✨'}
              index={i}
            />
          ))}
        </div>

        {/* Mobile see all */}
        <div className="mt-5 text-center sm:hidden">
          <Link to="/products"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/70 transition hover:text-white">
            View All Categories →
          </Link>
        </div>
      </div>
    </section>
  )
}

