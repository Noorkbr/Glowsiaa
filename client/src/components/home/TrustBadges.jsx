import { motion, useInView } from 'framer-motion'
import { Lock, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import { useRef } from 'react'

const badges = [
  { icon: ShieldCheck, title: 'Authentic Products' },
  { icon: Truck, title: 'Fast Delivery' },
  { icon: RotateCcw, title: 'Easy Returns' },
  { icon: Lock, title: 'Secure Payment' }
]

export default function TrustBadges() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        ref={ref}
        className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-4"
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.12 } }
        }}
      >
        {badges.map(({ icon: Icon, title }) => (
          <motion.div
            key={title}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-5"
          >
            <div className="rounded-full bg-glow-magenta/15 p-3 text-glow-magenta">
              <Icon size={22} />
            </div>
            <span className="font-medium text-white/90">{title}</span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
