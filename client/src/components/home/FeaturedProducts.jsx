import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import api from '../../api/axios'
import ProductCard from '../product/ProductCard'

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
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">Bestselling Products</h2>
          <div className="mt-4 h-1 w-28 rounded-full bg-glow-magenta" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-glow-magenta" />
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-16 text-center text-white/70">
            Featured products will appear here once the collection goes live.
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {products.map((product) => (
              <motion.div
                key={product?._id ?? product?.id}
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
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
