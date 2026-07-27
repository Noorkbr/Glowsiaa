import { AnimatePresence, motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

const getImageUrl = (image) => {
  if (!image) return 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=120&q=80'
  if (typeof image === 'string') return image
  return image.url || image.secure_url || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=120&q=80'
}

export default function SearchModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResults([])
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [isOpen])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/products', { params: { search: query.trim() } })
        const list = Array.isArray(data) ? data : data?.products ?? []
        setResults(Array.isArray(list) ? list.slice(0, 8) : [])
      } catch { setResults([]) } finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (product) => {
    navigate(`/product/${product._id ?? product.id}`)
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed left-1/2 top-20 z-[110] w-full max-w-2xl -translate-x-1/2 px-4"
          >
            <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#0f0f1e] shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
              <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
                <Search size={20} className="shrink-0 text-white/50" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search products, categories…"
                  className="flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/35"
                />
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-glow-magenta" />
                ) : (
                  <button type="button" onClick={onClose} className="rounded-lg p-1 text-white/50 transition hover:text-white">
                    <X size={18} />
                  </button>
                )}
              </div>

              {results.length > 0 && (
                <div className="max-h-[420px] overflow-y-auto p-3">
                  {results.map((product) => (
                    <button
                      key={product._id ?? product.id}
                      type="button"
                      onClick={() => handleSelect(product)}
                      className="flex w-full items-center gap-4 rounded-xl p-3 text-left transition hover:bg-white/5"
                    >
                      <img
                        src={getImageUrl(product.images?.[0] ?? product.image)}
                        alt={product.name}
                        className="h-14 w-14 shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-white">{product.name}</p>
                        <p className="mt-0.5 text-sm text-white/55 capitalize">{product.category}</p>
                      </div>
                      <p className="shrink-0 font-semibold text-glow-magenta">৳{Number(product.price || 0).toLocaleString('en-BD')}</p>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => { navigate(`/products?search=${encodeURIComponent(query)}`); onClose() }}
                    className="mt-2 w-full rounded-xl border border-white/10 py-3 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
                  >
                    See all results for &quot;{query}&quot;
                  </button>
                </div>
              )}

              {query.trim() && !loading && results.length === 0 && (
                <div className="px-5 py-10 text-center text-sm text-white/50">
                  No products found for &quot;{query}&quot;
                </div>
              )}

              {!query && (
                <div className="px-5 py-6 text-center text-sm text-white/35">
                  Start typing to search our collection…
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

