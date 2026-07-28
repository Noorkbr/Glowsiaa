import AnnouncementBar from '../components/layout/AnnouncementBar'
import CartDrawer from '../components/cart/CartDrawer'
import CheckoutDrawer from '../components/checkout/CheckoutDrawer'
import BeautyTipsSection from '../components/home/BeautyTipsSection'
import CategorySection from '../components/home/CategorySection'
import CategoryShowcase from '../components/home/CategoryShowcase'
import FeaturedProducts from '../components/home/FeaturedProducts'
import HeroCarousel from '../components/home/HeroCarousel'
import PromoCards from '../components/home/PromoCards'
import TestimonialsSection from '../components/home/TestimonialsSection'
import TrustBadges from '../components/home/TrustBadges'
import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'
import TopBanner from '../components/layout/TopBanner'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-midnight text-white">
      <TopBanner />
      <AnnouncementBar />
      <Navbar />
      <HeroCarousel />
      <TrustBadges />
      {/* Promotional cards — BOGO, COMBO, EXCLUSIVES, SALE */}
      <PromoCards />
      <FeaturedProducts />
      {/* Category showcase with sky-gradient cards */}
      <CategoryShowcase />
      <CategorySection />
      <BeautyTipsSection />
      <TestimonialsSection />
      <Footer />
      <CartDrawer />
      <CheckoutDrawer />
    </div>
  )
}