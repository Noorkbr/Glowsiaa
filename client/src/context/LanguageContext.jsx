/**
 * LanguageContext — English / Bangla bilingual support
 * Toggle with useLanguage().toggleLang()
 * All UI text should call t('key') to get the correct translation
 */
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const TRANSLATIONS = {
  en: {
    // Nav
    home: 'Home', products: 'Products', track: 'Track Order',
    account: 'Account', login: 'Login', logout: 'Logout',
    myOrders: 'My Orders', search: 'Search products...',
    // Hero
    trending: 'Trending', shopNow: 'Shop Now', ourStory: 'Our Story',
    exploreCollection: 'Explore Collection', newCollection: 'New Collection 2026',
    // Products
    viewAll: 'View All', addToCart: 'Add to Cart', addedToCart: 'Added to Cart!',
    outOfStock: 'Out of Stock', wishlist: 'Wishlist', bestselling: 'Bestselling',
    topPicks: 'Top Picks', featured: 'Featured', inStock: 'In Stock',
    // Cart / Checkout
    cart: 'Cart', checkout: 'Checkout', yourCart: 'Your Cart',
    cartEmpty: 'Your cart is empty', continueShopping: 'Continue Shopping',
    total: 'Total', subtotal: 'Subtotal', deliveryFee: 'Delivery Fee',
    freeDelivery: 'Free Delivery', orderSummary: 'Order Summary',
    placeOrder: 'Place Order', cod: 'Cash on Delivery',
    insideDhaka: 'Inside Dhaka', outsideDhaka: 'Outside Dhaka',
    // Categories
    categories: 'Categories', skincare: 'Skincare', makeup: 'Makeup',
    fragrance: 'Fragrance', haircare: 'Haircare', wellness: 'Wellness',
    // Flash sale
    flashSale: 'Flash Sale', endsIn: 'Ends in', hotDeals: 'Hot Deals',
    // Trust badges
    authenticProducts: '100% Authentic Products', fastDelivery: 'Fast Delivery',
    securePayment: 'Secure Payment', easyReturns: 'Easy Returns',
    // Footer
    newsletter: 'Get the glow-up newsletter ✨',
    newsletterSub: 'Beauty tips, exclusive deals & new arrivals — straight to your inbox.',
    subscribe: 'Subscribe', subscribed: "You're on the list! Check your inbox.",
    weAccept: 'We Accept', privacyPolicy: 'Privacy Policy', terms: 'Terms of Service',
    // Misc
    by: 'by', reviews: 'reviews', loading: 'Loading...', error: 'Something went wrong.',
    specialOffers: 'Special Offers',
  },
  bn: {
    // Nav
    home: 'হোম', products: 'পণ্য', track: 'অর্ডার ট্র্যাক',
    account: 'অ্যাকাউন্ট', login: 'লগইন', logout: 'লগআউট',
    myOrders: 'আমার অর্ডার', search: 'পণ্য খুঁজুন...',
    // Hero
    trending: 'ট্রেন্ডিং', shopNow: 'এখনই কিনুন', ourStory: 'আমাদের গল্প',
    exploreCollection: 'কালেকশন দেখুন', newCollection: 'নতুন কালেকশন ২০২৬',
    // Products
    viewAll: 'সব দেখুন', addToCart: 'কার্টে যোগ করুন', addedToCart: 'যোগ হয়েছে!',
    outOfStock: 'স্টক নেই', wishlist: 'পছন্দতালিকা', bestselling: 'সেরা বিক্রয়',
    topPicks: 'সেরা পছন্দ', featured: 'বিশেষ', inStock: 'স্টকে আছে',
    // Cart / Checkout
    cart: 'কার্ট', checkout: 'চেকআউট', yourCart: 'আপনার কার্ট',
    cartEmpty: 'আপনার কার্ট খালি', continueShopping: 'কেনাকাটা চালিয়ে যান',
    total: 'মোট', subtotal: 'উপমোট', deliveryFee: 'ডেলিভারি চার্জ',
    freeDelivery: 'বিনামূল্যে ডেলিভারি', orderSummary: 'অর্ডার সারাংশ',
    placeOrder: 'অর্ডার দিন', cod: 'ক্যাশ অন ডেলিভারি',
    insideDhaka: 'ঢাকার ভেতরে', outsideDhaka: 'ঢাকার বাইরে',
    // Categories
    categories: 'ক্যাটাগরি', skincare: 'স্কিনকেয়ার', makeup: 'মেকআপ',
    fragrance: 'পারফিউম', haircare: 'চুলের যত্ন', wellness: 'ওয়েলনেস',
    // Flash sale
    flashSale: 'ফ্ল্যাশ সেল', endsIn: 'শেষ হবে', hotDeals: 'দারুণ অফার',
    // Trust badges
    authenticProducts: '১০০% আসল পণ্য', fastDelivery: 'দ্রুত ডেলিভারি',
    securePayment: 'নিরাপদ পেমেন্ট', easyReturns: 'সহজ রিটার্ন',
    // Footer
    newsletter: 'গ্লো-আপ নিউজলেটার পান ✨',
    newsletterSub: 'বিউটি টিপস, এক্সক্লুসিভ ডিল এবং নতুন পণ্য — সরাসরি আপনার ইনবক্সে।',
    subscribe: 'সাবস্ক্রাইব করুন', subscribed: 'তালিকায় যোগ হয়েছেন!',
    weAccept: 'পেমেন্ট পদ্ধতি', privacyPolicy: 'গোপনীয়তা নীতি', terms: 'শর্তাবলী',
    // Misc
    by: 'দ্বারা', reviews: 'রিভিউ', loading: 'লোড হচ্ছে...', error: 'কিছু সমস্যা হয়েছে।',
    specialOffers: 'বিশেষ অফার',
  },
}

const LanguageContext = createContext({ lang: 'en', t: (k) => k, toggleLang: () => {} })

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('glowsiaa_lang') || 'en' } catch { return 'en' }
  })

  const toggleLang = useCallback(() => {
    setLang((l) => {
      const next = l === 'en' ? 'bn' : 'en'
      try { localStorage.setItem('glowsiaa_lang', next) } catch { /* ignore */ }
      return next
    })
  }, [])

  const t = useCallback((key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key, [lang])

  // Apply Bangla font class to <html> for better rendering
  useEffect(() => {
    document.documentElement.lang = lang === 'bn' ? 'bn' : 'en'
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)

