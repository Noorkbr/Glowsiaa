import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useRealtime } from '../../context/RealtimeContext'

// Fallback categories used until DB responds
const FALLBACK = [
  { name: 'Skincare', slug: 'skincare', emoji: '✨', gradient: 'from-[#6E3992] to-[#D5106E]', productCount: null },
  { name: 'Makeup',   slug: 'makeup',   emoji: '💄', gradient: 'from-[#ff4d8d] to-[#f04444]', productCount: null },
  { name: 'Fragrance',slug: 'fragrance',emoji: '💧', gradient: 'from-[#3d7cff] to-[#6E3992]', productCount: null },
  { name: 'Haircare', slug: 'haircare', emoji: '🌿', gradient: 'from-[#00b894] to-[#00cec9]', productCount: null },
]

export default function CategorySection() {
  const [categories, setCategories] = useState(FALLBACK)
  const categoriesKey = useRealtime('categories')

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => {
        if (data.categories?.length > 0) setCategories(data.categories)
      })
      .catch(() => {})
  }, [categoriesKey])

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-glow-magenta">Explore by category</p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl">Shop your glow ritual</h2>
          </div>
          <Link to="/products" className="hidden text-sm font-medium text-white/60 transition hover:text-white sm:block">
            View All →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat._id || cat.slug}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group"
            >
              <Link
                to={`/products?category=${cat.slug}`}
                className={`block rounded-2xl border border-white/10 bg-gradient-to-br ${cat.gradient || 'from-[#6E3992] to-[#D5106E]'} p-6 transition duration-300 hover:-translate-y-2 hover:shadow-[0_22px_60px_rgba(213,16,110,0.24)]`}
              >
                {cat.imageUrl ? (
                  <div className="mb-4 h-16 w-16 overflow-hidden rounded-2xl">
                    <img src={cat.imageUrl} alt={cat.name} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="inline-flex rounded-2xl bg-white/15 p-4 text-3xl backdrop-blur-sm">
                    {cat.emoji || '✨'}
                  </div>
                )}
                <h3 className="mt-4 font-heading text-2xl font-semibold text-white drop-shadow-sm">{cat.name}</h3>
                {cat.description && (
                  <p className="mt-1 text-sm text-white/80 line-clamp-1">{cat.description}</p>
                )}
                <p className="mt-2 text-sm font-medium text-white/90">
                  {cat.productCount !== null && cat.productCount !== undefined ? `${cat.productCount} Products` : 'Shop Now →'}
                </p>
              </Link>

              {/* Subcategories */}
              {cat.subcategories?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 px-1">
                  {cat.subcategories.slice(0, 4).map(sub => (
                    <Link
                      key={sub._id || sub.slug}
                      to={`/products?category=${cat.slug}&subCategory=${sub.slug}`}
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/70 transition hover:border-glow-magenta/40 hover:bg-glow-magenta/10 hover:text-white"
                    >
                      {sub.emoji && <span className="mr-1">{sub.emoji}</span>}
                      {sub.name}
                    </Link>
                  ))}
                  {cat.subcategories.length > 4 && (
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/40">
                      +{cat.subcategories.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
