import { ChevronRight, Minus, Plus, Star } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/axios'
import CartDrawer from '../components/cart/CartDrawer'
import CheckoutDrawer from '../components/checkout/CheckoutDrawer'
import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'
import { useCart } from '../context/CartContext'

const formatCurrency = (value) => `৳${Number(value || 0).toLocaleString('en-BD')}`
const getImageUrl = (image) => {
  if (!image) return 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80'
  if (typeof image === 'string') return image
  return image.url || image.secure_url || image.src || image.path || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80'
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const { addToCart, openDrawer, openCheckout } = useCart()
  const [product, setProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const { data } = await api.get(`/products/${id}`)
        const productData = data?.product ?? data?.data ?? data
        setProduct(productData)
        const primaryImage = Array.isArray(productData?.images) && productData.images.length > 0
          ? getImageUrl(productData.images[0])
          : getImageUrl(productData?.image)
        setSelectedImage(primaryImage)
      } catch {
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const images = useMemo(() => {
    if (!product) return []
    const list = Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image]
    return list.map(getImageUrl)
  }, [product])

  const handleAddToCart = () => {
    if (!product) return
    addToCart(product, quantity)
    openDrawer()
  }

  const handleBuyNow = () => {
    if (!product) return
    addToCart(product, quantity)
    openCheckout()
  }

  return (
    <div className="min-h-screen bg-midnight text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-glow-magenta" />
          </div>
        ) : !product ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-16 text-center text-white/65">
            Product not found.
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <section>
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
                <img src={selectedImage || images[0]} alt={product?.name} className="h-[520px] w-full object-cover" />
              </div>
              <div className="mt-4 grid grid-cols-4 gap-4">
                {images.map((image) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className={`overflow-hidden rounded-2xl border ${selectedImage === image ? 'border-glow-magenta' : 'border-white/10'} bg-white/5`}
                  >
                    <img src={image} alt={product?.name} className="h-24 w-full object-cover" />
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="flex flex-wrap items-center gap-2 text-sm text-white/55">
                <Link to="/" className="transition hover:text-white">Home</Link>
                <ChevronRight size={14} />
                <Link to="/products" className="transition hover:text-white">Products</Link>
                <ChevronRight size={14} />
                <span className="text-white/80">{product?.name}</span>
              </div>

              <h1 className="mt-6 font-heading text-4xl font-bold text-white">{product?.name}</h1>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={18} className="text-[#F4C542]" fill={index < Math.round(product?.rating ?? 5) ? '#F4C542' : 'transparent'} />
                  ))}
                </div>
                <span className="text-sm text-white/55">{Number(product?.reviewCount ?? product?.reviews?.length ?? 0)} reviews</span>
              </div>

              <div className="mt-6 flex items-end gap-4">
                <span className="text-3xl font-bold text-white">{formatCurrency(product?.price)}</span>
                {product?.comparePrice && product.comparePrice !== product.price && (
                  <span className="text-lg text-white/35 line-through">{formatCurrency(product.comparePrice)}</span>
                )}
              </div>

              <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">{product?.description ?? 'A premium beauty essential crafted to elevate your daily glow routine.'}</p>

              <div className="mt-8 flex items-center gap-4">
                <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} className="rounded-full p-2 text-white/75 transition hover:bg-white/5 hover:text-white" aria-label="Decrease quantity">
                    <Minus size={16} />
                  </button>
                  <span className="min-w-[3rem] text-center font-semibold text-white">{quantity}</span>
                  <button type="button" onClick={() => setQuantity((current) => current + 1)} className="rounded-full p-2 text-white/75 transition hover:bg-white/5 hover:text-white" aria-label="Increase quantity">
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <button type="button" onClick={handleAddToCart} className="flex-1 rounded-2xl bg-glow-magenta px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white" style={{ boxShadow: '0 0 28px rgba(213, 16, 110, 0.35)' }}>
                  Add to Cart
                </button>
                <button type="button" onClick={handleBuyNow} className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white/10">
                  Buy Now
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
      <Footer />
      <CartDrawer />
      <CheckoutDrawer />
    </div>
  )
}
