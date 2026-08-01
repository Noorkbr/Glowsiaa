import { ChevronRight, Heart, Minus, Plus, Star, Youtube } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/axios'
import CartDrawer from '../components/cart/CartDrawer'
import CheckoutDrawer from '../components/checkout/CheckoutDrawer'
import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'
import ProductCursor from '../components/ui/ProductCursor'
import WhatsAppButton from '../components/ui/WhatsAppButton'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

const formatCurrency = (value) => `৳${Number(value || 0).toLocaleString('en-BD')}`
const getImageUrl = (image) => {
  if (!image) return 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80'
  if (typeof image === 'string') return image
  return image.url || image.secure_url || image.src || image.path || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80'
}

// Convert any YouTube URL format to an embed URL
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null
  try {
    const parsed = new URL(url)
    let videoId = null
    if (parsed.hostname.includes('youtu.be')) {
      videoId = parsed.pathname.slice(1)
    } else if (parsed.hostname.includes('youtube.com')) {
      videoId = parsed.searchParams.get('v')
      if (!videoId && parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/embed/')[1]
      }
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : null
  } catch {
    return null
  }
}

function SkeletonDetail() {
  return (
    <div className="grid animate-pulse gap-10 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-4">
        <div className="h-[520px] rounded-[2rem] bg-white/10" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => <div key={i} className="h-24 rounded-2xl bg-white/10" />)}
        </div>
      </div>
      <div className="space-y-4 pt-10">
        <div className="h-4 w-1/3 rounded-full bg-white/10" />
        <div className="h-10 w-2/3 rounded-full bg-white/10" />
        <div className="h-4 w-1/4 rounded-full bg-white/10" />
        <div className="h-8 w-1/3 rounded-full bg-white/10" />
        <div className="h-24 rounded-2xl bg-white/10" />
        <div className="h-12 rounded-2xl bg-white/10" />
        <div className="h-12 rounded-2xl bg-white/10" />
      </div>
    </div>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const { addToCart, openDrawer, openCheckout } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
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

  const productId = product?._id ?? product?.id
  const wishlisted = isWishlisted(productId)

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
      <ProductCursor />
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {loading ? (
          <SkeletonDetail />
        ) : !product ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-16 text-center">
            <p className="text-white/65">Product not found.</p>
            <Link to="/products" className="mt-6 inline-flex rounded-full bg-glow-magenta px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white">
              Browse Products
            </Link>
          </div>
        ) : (
          <>
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <section>
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
                <img src={selectedImage || images[0]} alt={product?.name} className="h-[520px] w-full object-cover" />
              </div>
              {images.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-4">
                  {images.map((image) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className={`overflow-hidden rounded-2xl border ${selectedImage === image ? 'border-glow-magenta' : 'border-white/10'} bg-white/5 transition hover:border-white/30`}
                    >
                      <img src={image} alt={product?.name} className="h-24 w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2 text-sm text-white/55">
                <Link to="/" className="transition hover:text-white">Home</Link>
                <ChevronRight size={14} />
                <Link to="/products" className="transition hover:text-white">Products</Link>
                <ChevronRight size={14} />
                <span className="capitalize text-white/80">{product?.category}</span>
              </div>

              <h1 className="mt-6 font-heading text-4xl font-bold text-white">{product?.name}</h1>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={18} className="text-[#F4C542]" fill={index < Math.round(product?.rating ?? 5) ? '#F4C542' : 'transparent'} />
                  ))}
                </div>
                <span className="text-sm text-white/55">{Number(product?.reviewCount ?? 0)} reviews</span>
                {product?.badge && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/80">
                    {product.badge}
                  </span>
                )}
              </div>

              <div className="mt-6 flex items-end gap-4">
                <span className="text-3xl font-bold text-white">{formatCurrency(product?.price)}</span>
                {product?.comparePrice && product.comparePrice !== product.price && (
                  <span className="text-lg text-white/35 line-through">{formatCurrency(product.comparePrice)}</span>
                )}
                {product?.discount > 0 && (
                  <span className="rounded-full bg-glow-magenta px-3 py-1 text-sm font-bold text-white">
                    -{product.discount}%
                  </span>
                )}
              </div>

              <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">
                {product?.description ?? 'A premium beauty essential crafted to elevate your daily glow routine.'}
              </p>

              <div className="mt-4 text-sm text-white/50">
                {product?.stock > 0 ? (
                  <span className="text-emerald-400">✓ In stock ({product.stock} available)</span>
                ) : (
                  <span className="text-red-400">Out of stock</span>
                )}
              </div>

              <div className="mt-8 flex items-center gap-4">
                <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((c) => Math.max(1, c - 1))}
                    className="rounded-full p-2 text-white/75 transition hover:bg-white/5 hover:text-white"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="min-w-[3rem] text-center font-semibold text-white">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((c) => Math.min(c + 1, product?.stock || 99))}
                    className="rounded-full p-2 text-white/75 transition hover:bg-white/5 hover:text-white"
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-medium transition ${
                    wishlisted
                      ? 'border-glow-magenta/50 bg-glow-magenta/10 text-glow-magenta'
                      : 'border-white/15 bg-white/5 text-white/70 hover:border-glow-magenta/40 hover:text-glow-magenta'
                  }`}
                >
                  <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
                  {wishlisted ? 'Saved' : 'Save'}
                </button>
              </div>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product?.stock === 0}
                  className="flex-1 rounded-2xl bg-glow-magenta px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ boxShadow: '0 0 28px rgba(213, 16, 110, 0.35)' }}
                >
                  Add to Cart
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={product?.stock === 0}
                  className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Buy Now
                </button>
              </div>
            </section>
          </div>

          {/* ── YouTube Video Section ── */}
          {(() => {
            const embedUrl = getYouTubeEmbedUrl(product?.youtubeUrl)
            if (!embedUrl) return null
            return (
              <div className="mt-16">
                <div className="mb-6 flex items-center gap-3">
                  <Youtube size={24} className="text-red-500" />
                  <h2 className="font-heading text-2xl font-bold text-white">Product Video</h2>
                </div>
                <div
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
                  style={{ paddingTop: '56.25%', position: 'relative' }}
                >
                  <iframe
                    src={embedUrl}
                    title={`${product?.name} video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                  />
                </div>
              </div>
            )
          })()}
          </>
        )}
      </main>
      <Footer />
      <CartDrawer />
      <CheckoutDrawer />
      <WhatsAppButton />
    </div>
  )
}
