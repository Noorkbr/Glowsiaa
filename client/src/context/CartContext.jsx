import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)

const getProductId = (product) => product?._id ?? product?.id

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  useEffect(() => {
    try {
      const storedItems = JSON.parse(localStorage.getItem('cartItems') ?? '[]')
      if (Array.isArray(storedItems)) {
        setItems(storedItems)
      }
    } catch {
      setItems([])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(items))
  }, [items])

  const addToCart = (product, quantity = 1) => {
    const productId = getProductId(product)
    if (!productId) return

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => getProductId(item) === productId)
      if (existingItem) {
        return currentItems.map((item) =>
          getProductId(item) === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...currentItems, { ...product, quantity }]
    })
  }

  const removeFromCart = (productId) => {
    setItems((currentItems) => currentItems.filter((item) => getProductId(item) !== productId))
  }

  const updateQuantity = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId)
      return
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        getProductId(item) === productId ? { ...item, quantity: qty } : item
      )
    )
  }

  const clearCart = () => setItems([])
  const openDrawer = () => setIsDrawerOpen(true)
  const closeDrawer = () => setIsDrawerOpen(false)
  const openCheckout = () => setIsCheckoutOpen(true)
  const closeCheckout = () => setIsCheckoutOpen(false)

  const cartTotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0),
    [items]
  )

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items]
  )

  const value = useMemo(() => ({
    items,
    isDrawerOpen,
    isCheckoutOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    openDrawer,
    closeDrawer,
    openCheckout,
    closeCheckout,
    cartTotal,
    cartCount
  }), [cartCount, cartTotal, isCheckoutOpen, isDrawerOpen, items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
