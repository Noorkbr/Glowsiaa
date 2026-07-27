import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import CartDrawer from '../components/cart/CartDrawer'
import CheckoutDrawer from '../components/checkout/CheckoutDrawer'
import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'
import ProductCard from '../components/product/ProductCard'

const fallbackCategories = ['All', 'Skincare', 'Makeup', 'Fragrance', 'Haircare']
const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : str

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const cat = searchParams.get('category')
    return cat ? capitalize(cat) : 'All'
  })
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [sortBy, setSortBy] = useState('featured')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const { data } = await api.get('/products', {
          params: {
            category: selectedCategory !== 'All' ? selectedCategory.toLowerCase() : undefined,
            search: searchQuery || undefined,
          }
        })
        const list = Array.isArray(data) ? data : data?.products ?? data?.data ?? []
        setProducts(Array.isArray(list) ? list : [])
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [searchQuery, selectedCategory])

  useEffect(() => {
    const params = {}
    if (selectedCategory !== 'All') params.category = selectedCategory.toLowerCase()
    if (searchQuery) params.search = searchQuery
    setSearchParams(params, { replace: true })
  }, [selectedCategory, searchQuery, setSearchParams])

  const categories = useMemo(() => {
    const dynamic = [...new Set(
      products.map((p) => p?.category).filter(Boolean).map(capitalize)
    )]
    return ['All', ...new Set([...fallbackCategories.slice(1), ...dynamic])]
  }, [products])

  const displayedProducts = useMemo(() => {
    let nextProducts = [...products]

    if (selectedCategory !== 'All') {
      nextProducts = nextProducts.filter((product) =>
        (product?.category ?? '').toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase()
      nextProducts = nextProducts.filter((product) =>
        `${product?.name ?? ''} ${product?.description ?? ''}`.toLowerCase().includes(query)
      )
    }

    if (sortBy === 'price-low') {
      nextProducts.sort((a, b) => Number(a?.price || 0) - Number(b?.price || 0))
    } else if (sortBy === 'price-high') {
      nextProducts.sort((a, b) => Number(b?.price || 0) - Number(a?.price || 0))
    } else if (sortBy === 'rating') {
      nextProducts.sort((a, b) => Number(b?.rating || 0) - Number(a?.rating || 0))
    }

    return nextProducts
  }, [products, searchQuery, selectedCategory, sortBy])

  return (
    <div className="min-h-screen bg-midnight text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-glow-magenta">Shop the collection</p>
            <h1 className="mt-3 font-heading text-4xl font-bold text-white">Premium cosmetics for every glow ritual</h1>
          </div>
          <div className="relative w-full max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by product or concern"
              className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white outline-none transition focus:border-glow-magenta"
            />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-3xl border border-white/10 bg-white/5 p-5 lg:sticky lg:top-24 lg:h-fit">
            <div>
              <h2 className="font-heading text-xl font-semibold text-white">Categories</h2>
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap rounded-full px-4 py-3 text-sm font-medium transition lg:text-left ${
                      selectedCategory === category
                        ? 'bg-glow-magenta text-white'
                        : 'border border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <label className="mb-3 block text-sm font-semibold uppercase tracking-[0.18em] text-white/55">Sort By</label>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#14141f] px-4 py-3 text-white outline-none transition focus:border-glow-magenta"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </aside>

          <section>
            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-white/10 bg-white/5">
                    <div className="h-72 rounded-t-2xl bg-white/10" />
                    <div className="space-y-3 p-5">
                      <div className="h-5 rounded-full bg-white/10" />
                      <div className="h-4 w-2/3 rounded-full bg-white/10" />
                      <div className="h-10 rounded-xl bg-white/10" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-16 text-center text-white/65">
                No products matched your filters. Try another category or search term.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {displayedProducts.map((product) => (
                  <ProductCard key={product?._id ?? product?.id} product={product} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
      <CartDrawer />
      <CheckoutDrawer />
    </div>
  )
}
