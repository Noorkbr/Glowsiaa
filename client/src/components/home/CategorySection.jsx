import { Droplets, Heart, Sparkles, Wind } from 'lucide-react'
import { Link } from 'react-router-dom'

const categories = [
  { name: 'Skincare', value: 'skincare', count: 48, icon: Sparkles, gradient: 'from-[#6E3992] to-[#D5106E]' },
  { name: 'Makeup', value: 'makeup', count: 62, icon: Heart, gradient: 'from-[#ff4d8d] to-[#f04444]' },
  { name: 'Fragrance', value: 'fragrance', count: 21, icon: Droplets, gradient: 'from-[#3d7cff] to-[#6E3992]' },
  { name: 'Haircare', value: 'haircare', count: 34, icon: Wind, gradient: 'from-[#00b894] to-[#00cec9]' }
]

export default function CategorySection() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-glow-magenta">Explore by category</p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl">Shop your glow ritual</h2>
          </div>
          <Link to="/products" className="hidden text-sm font-medium text-white/60 transition hover:text-white sm:block">
            View All →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map(({ name, value, count, icon: Icon, gradient }) => (
            <Link
              key={name}
              to={`/products?category=${value}`}
              className={`group block rounded-2xl border border-white/10 bg-gradient-to-br ${gradient} p-6 transition duration-300 hover:-translate-y-2 hover:shadow-[0_22px_60px_rgba(213,16,110,0.24)]`}
            >
              <div className="inline-flex rounded-2xl bg-white/15 p-4 text-white backdrop-blur-sm">
                <Icon size={26} />
              </div>
              <h3 className="mt-6 font-heading text-2xl font-semibold text-white">{name}</h3>
              <p className="mt-2 text-sm text-white/80">{count} Products</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
