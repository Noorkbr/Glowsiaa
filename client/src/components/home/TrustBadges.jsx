import { motion } from 'framer-motion'
import { Lock, RotateCcw, ShieldCheck, Truck } from 'lucide-react'

const badges = [
  { icon: ShieldCheck, title: '100% Authentic', sub: 'Verified products only', color: 'text-emerald-400' },
  { icon: Truck,       title: 'Fast Delivery',  sub: 'Dhaka 1–2 days',         color: 'text-blue-400' },
  { icon: RotateCcw,  title: 'Easy Returns',   sub: '7-day return policy',     color: 'text-purple-400' },
  { icon: Lock,        title: 'Secure Payment', sub: 'bKash, Nagad, COD',      color: 'text-glow-magenta' },
]

export default function TrustBadges() {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-3 grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {badges.map(({ icon: Icon, title, sub, color }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 sm:gap-4 sm:px-5 sm:py-5 transition-shadow hover:shadow-[0_8px_32px_rgba(213,16,110,0.12)]"
          >
            <motion.div
              className={`shrink-0 rounded-2xl bg-white/10 p-2.5 sm:p-3 ${color}`}
              whileHover={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 0.4 }}
            >
              <Icon size={20} className="sm:h-6 sm:w-6" />
            </motion.div>
            <div className="min-w-0">
              <p className="font-semibold text-white text-sm sm:text-base">{title}</p>
              <p className="text-xs text-white/50 hidden sm:block">{sub}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
