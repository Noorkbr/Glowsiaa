import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import CartDrawer from '../components/cart/CartDrawer'
import CheckoutDrawer from '../components/checkout/CheckoutDrawer'
import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'
import ProductCard from '../components/product/ProductCard'
import ProductCursor from '../components/ui/ProductCursor'
import WhatsAppButton from '../components/ui/WhatsAppButton'

const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : str

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [dbCategories, setDbCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') || 'all')
  const [selectedSubCategory, setSelectedSubCategory] = useState(() => searchParams.get('subCategory') || '')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [sortBy, setSortBy] = useState('featured')

  // Load categories tree
  useEffect(() => {
    api.get('/categories').then(({ data }) => setDbCategories(data.categories || [])).catch(() => {})
  }, [])

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = {}
        if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory.toLowerCase()
        if (selectedSubCategory) params.subCategory = selectedSubCategory.toLowerCase()
        if (searchQuery) params.search = searchQuery
        const { data } = await api.get('/products', { params })
        const list = Array.isArray(data) ? data : data?.products ?? data?.data ?? []
        setProducts(Array.isArray(list) ? list : [])
      } catch { setProducts([]) }
      setLoading(false)
    }
    fetchProducts()
  }, [searchQuery, selectedCategory, selectedSubCategory])

  // Sync URL params
  useEffect(() => {
    const params = {}
    if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory.toLowerCase()
    if (selectedSubCategory) params.subCategory = selectedSubCategory.toLowerCase()
    if (searchQuery) params.search = searchQuery
    setSearchParams(params, { replace: true })
  }, [selectedCategory, selectedSubCategory, searchQuery, setSearchParams])

  // Build category list from DB + fallback
  const categoryList = useMemo(() => {
    if (dbCategories.length > 0) return dbCategories
    const unique = [...new Set(products.map(p => p.category).filter(Boolean))]
    return unique.map(c => ({ slug: c, name: capitalize(c), subcategories: [] }))
  }, [dbCategories, products])

  // Subcategories of the selected category
  const subcategoryList = useMemo(() => {
    const cat = categoryList.find(c => c.slug === selectedCategory)
    return cat?.subcategories || []
  }, [categoryList, selectedCategory])

  const displayedProducts = useMemo(() => {
    let next = [...products]
    if (sortBy === 'price-low') next.sort((a, b) => Number(a?.price || 0) - Number(b?.price || 0))
    else if (sortBy === 'price-high') next.sort((a, b) => Number(b?.price || 0) - Number(a?.price || 0))
    else if (sortBy === 'rating') next.sort((a, b) => Number(b?.rating || 0) - Number(a?.rating || 0))
    return next
  }, [products, sortBy])

  const handleCategorySelect = (slug) => {
    setSelectedCategory(slug)
    setSelectedSubCategory('')
  }

  return (
    <div className="min-h-screen bg-midnight text-white">
      <ProductCursor />
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-glow-magenta">Shop the collection</p>
            <h1 className="mt-3 font-heading text-4xl font-bold text-white">
              {selectedCategory && selectedCategory !== 'all'
                ? capitalize(selectedCategory)
                : 'All Products'}
            </h1>
            {selectedSubCategory && (
              <p className="mt-1 text-white/60">
                in <span className="text-glow-magenta">{capitalize(selectedSubCategory)}</span>
              </p>
            )}
          </div>
          <div className="relative w-full max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product or concern"
              className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white outline-none transition focus:border-glow-magenta"
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr] xl:grid-cols-[280px_1fr]">
          <aside className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 lg:sticky lg:top-24 lg:h-fit">
            <h2 className="font-heading text-xl font-semibold text-white mb-4">Categories</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
              <button type="button"
                onClick={() => handleCategorySelect('all')}
                className={`whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition lg:text-left ${
                  (!selectedCategory || selectedCategory === 'all')
                    ? 'bg-glow-magenta text-white' : 'border border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/5 hover:text-white'
                }`}>
                All Products
              </button>
              {categoryList.map(cat => (
                <div key={cat._id || cat.slug}>
                  <button type="button"
                    onClick={() => handleCategorySelect(cat.slug)}
                    className={`flex w-full items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition lg:text-left ${
                      selectedCategory === cat.slug
                        ? 'bg-glow-magenta text-white' : 'border border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/5 hover:text-white'
                    }`}>
                    {cat.emoji && <span>{cat.emoji}</span>}
                    {cat.name}
                  </button>
                  {/* Subcategories */}
                  {selectedCategory === cat.slug && subcategoryList.length > 0 && (
                    <div className="mt-1 ml-4 space-y-1">
                      <button type="button"
                        onClick={() => setSelectedSubCategory('')}
                        className={`w-full rounded-full px-3 py-1.5 text-xs font-medium text-left transition ${
                          !selectedSubCategory ? 'text-glow-magenta' : 'text-white/55 hover:text-white'
                        }`}>
                        All {cat.name}
                      </button>
                      {subcategoryList.map(sub => (
                        <button key={sub._id || sub.slug} type="button"
                          onClick={() => setSelectedSubCategory(sub.slug)}
                          className={`w-full rounded-full px-3 py-1.5 text-xs font-medium text-left transition ${
                            selectedSubCategory === sub.slug ? 'text-glow-magenta' : 'text-white/55 hover:text-white'
                          }`}>
                          {sub.emoji && <span className="mr-1">{sub.emoji}</span>}{sub.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-white/55">Sort By</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#14141f] px-4 py-3 text-white outline-none focus:border-glow-magenta">
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
      <WhatsAppButton />
    </div>
  )
}

