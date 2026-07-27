import { motion, useInView } from 'framer-motion'
import { Star } from 'lucide-react'
import { useRef } from 'react'

const testimonials = [
  {
    name: 'Sarah R.',
    rating: 5,
    review: 'Absolutely love Glowsiaa! The products are genuine and arrived in 2 days.'
  },
  {
    name: 'Nadia K.',
    rating: 5,
    review: 'Best cosmetics store in Bangladesh. My skin has never looked better!'
  },
  {
    name: 'Fatima H.',
    rating: 4,
    review: 'Great quality, fair prices. Will definitely order again!'
  }
]

export default function TestimonialsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="our-story" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-glow-magenta">Loved by our community</p>
          <h2 className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl">Real reviews. Real glow.</h2>
        </div>

        <motion.div
          ref={ref}
          className="grid gap-6 lg:grid-cols-3"
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-glow-magenta font-heading text-lg font-bold text-white">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="mt-1 flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, index) => (
                      <Star key={index} size={16} className="text-[#F4C542]" fill="#F4C542" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-5 text-white/70">“{testimonial.review}”</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
