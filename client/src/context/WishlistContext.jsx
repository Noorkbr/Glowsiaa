import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

const WishlistContext = createContext(null)
const getProductId = (product) => product?._id ?? product?.id

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('wishlistItems') ?? '[]')
      if (Array.isArray(stored)) setItems(stored)
    } catch {
      setItems([])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('wishlistItems', JSON.stringify(items))
  }, [items])

  const toggleWishlist = useCallback((product) => {
    const productId = getProductId(product)
    if (!productId) return

    setItems((current) => {
      const exists = current.some((item) => getProductId(item) === productId)
      if (exists) {
        setTimeout(() => toast('Removed from wishlist', { icon: '💔', duration: 2000 }), 0)
        return current.filter((item) => getProductId(item) !== productId)
      }
      setTimeout(() => toast.success('Added to wishlist! ❤️', { duration: 2000 }), 0)
      return [...current, product]
    })
  }, [])

  const isWishlisted = useCallback(
    (productId) => items.some((item) => getProductId(item) === productId),
    [items]
  )

  const removeFromWishlist = useCallback((productId) => {
    setItems((current) => current.filter((item) => getProductId(item) !== productId))
  }, [])

  const wishlistCount = useMemo(() => items.length, [items])

  const value = useMemo(
    () => ({ items, wishlistCount, toggleWishlist, isWishlisted, removeFromWishlist }),
    [items, wishlistCount, toggleWishlist, isWishlisted, removeFromWishlist]
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider')
  return context
}

