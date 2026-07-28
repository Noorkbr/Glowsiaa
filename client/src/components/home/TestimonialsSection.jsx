import { motion } from 'framer-motion'
import { Quote, Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Nusrat Jahan',
    location: 'Dhaka',
    rating: 5,
    review: 'Absolutely love Glowsiaa! The Vitamin C serum transformed my skin in just 2 weeks. Arrived beautifully packaged and 100% authentic.',
    avatar: 'N',
    color: 'from-pink-500 to-rose-500',
  },
  {
    name: 'Farhana Akter',
    location: 'Chattogram',
    rating: 5,
    review: 'Best cosmetics store in Bangladesh. The lipstick shades are stunning and the delivery was incredibly fast. Will definitely order again!',
    avatar: 'F',
    color: 'from-violet-500 to-purple-600',
  },
  {
    name: 'Sharmin Sultana',
    location: 'Rajshahi',
    rating: 5,
    review: 'The hair oil is pure magic — my hair feels so soft and shiny. Great quality, fair prices. Glowsiaa is now my go-to beauty brand.',
    avatar: 'S',
    color: 'from-blue-500 to-cyan-500',
  },
]

export default function TestimonialsSection() {
  return (
    <section id="our-story" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm uppercase tracking-[0.3em] text-glow-magenta">Loved by our community</p>
          <h2 className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl">
            Real reviews. Real glow.
          </h2>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-glow-magenta to-glow-purple" />
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 32, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-shadow hover:shadow-[0_20px_60px_rgba(213,16,110,0.14)]"
            >
              {/* Quote icon */}
              <div className="absolute right-5 top-5 text-glow-magenta/20">
                <Quote size={40} fill="currentColor" />
              </div>

              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <motion.div
                    key={j}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.3 + j * 0.06 + i * 0.12 }}
                    viewport={{ once: true }}
                  >
                    <Star size={14} className="text-[#F4C542]" fill="#F4C542" />
                  </motion.div>
                ))}
              </div>

              <p className="text-base leading-7 text-white/75">
                &ldquo;{t.review}&rdquo;
              </p>

              <div className="mt-6 flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-sm font-bold text-white shadow-lg`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-white/45">{t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
