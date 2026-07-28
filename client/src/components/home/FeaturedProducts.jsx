import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Reveal from '../ui/Reveal'
import ProductCard from '../product/ProductCard'

const SkeletonCard = () => (
  <div className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-white/5">
    <div className="h-72 bg-white/10" />
    <div className="space-y-3 p-5">
      <div className="h-3 w-1/3 rounded-full bg-white/10" />
      <div className="h-5 rounded-full bg-white/10" />
      <div className="h-4 w-2/3 rounded-full bg-white/10" />
      <div className="h-10 rounded-xl bg-white/10" />
    </div>
  </div>
)

export default function FeaturedProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true)
        const { data } = await api.get('/products', { params: { isFeatured: true } })
        const list = Array.isArray(data) ? data : data?.products ?? data?.data ?? []
        setProducts(Array.isArray(list) ? list : [])
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchFeaturedProducts()
  }, [])

  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-glow-magenta/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Section header */}
        <Reveal>
          <div className="mb-14 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-glow-magenta/20 bg-glow-magenta/10 px-4 py-1.5">
                <Sparkles size={14} className="text-glow-magenta" />
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-glow-magenta">Top Picks</span>
              </div>
              <h2 className="font-heading text-4xl font-bold text-white sm:text-5xl">
                Bestselling{' '}
                <span style={{ background: 'linear-gradient(135deg, #D5106E, #9B2FD0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Products
                </span>
              </h2>
              <p className="mt-3 text-white/55">Handpicked by our beauty experts, loved by thousands.</p>
            </div>
            <motion.div whileHover={{ x: 4 }}>
              <Link
                to="/products"
                className="group inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/70 transition hover:border-glow-magenta/40 hover:text-white"
              >
                View All
                <ArrowRight size={15} className="transition group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </Reveal>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-16 text-center text-white/55">
            Featured products will appear here once the collection goes live.
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {products.map((product) => (
              <motion.div
                key={product?._id ?? product?.id}
                variants={{
                  hidden: { opacity: 0, y: 32, scale: 0.95, filter: 'blur(4px)' },
                  visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
                }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
