import CartDrawer from '../components/cart/CartDrawer'
import CheckoutDrawer from '../components/checkout/CheckoutDrawer'
import CategorySection from '../components/home/CategorySection'
import FeaturedProducts from '../components/home/FeaturedProducts'
import HeroSection from '../components/home/HeroSection'
import TestimonialsSection from '../components/home/TestimonialsSection'
import TrustBadges from '../components/home/TrustBadges'
import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'
import TopBanner from '../components/layout/TopBanner'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-midnight text-white">
      <TopBanner />
      <Navbar />
      <HeroSection />
      <TrustBadges />
      <FeaturedProducts />
      <CategorySection />
      <TestimonialsSection />
      <Footer />
      <CartDrawer />
      <CheckoutDrawer />
    </div>
  )
}
