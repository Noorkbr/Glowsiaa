import { motion } from 'framer-motion'
import { ArrowRight, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useRealtime } from '../../context/RealtimeContext'

const CAT_COLORS = {
  skincare:  'from-pink-500/20 to-rose-500/20 border-pink-500/20',
  makeup:    'from-red-500/20 to-orange-500/20 border-red-500/20',
  fragrance: 'from-blue-500/20 to-indigo-500/20 border-blue-500/20',
  haircare:  'from-emerald-500/20 to-teal-500/20 border-emerald-500/20',
  wellness:  'from-purple-500/20 to-violet-500/20 border-purple-500/20',
}

const DEFAULT_TIPS = [
  { title: 'Morning Glow Routine', content: 'Start with a gentle cleanser, then apply Vitamin C serum before your moisturizer for the best brightening effect throughout the day.', category: 'skincare', emoji: '✨', readTime: 2 },
  { title: 'Perfect Bold Lip in 3 Steps', content: 'Exfoliate lips gently, apply a lip liner slightly outside your natural lip line, then fill in with your favorite lipstick shade. Blot and reapply for longevity.', category: 'makeup', emoji: '💄', readTime: 2 },
  { title: 'Hair Oil Massage Technique', content: 'Warm the oil slightly, apply to scalp in circular motions, work through ends. Leave overnight wrapped in a silk scarf for maximum absorption and shine.', category: 'haircare', emoji: '🌿', readTime: 3 },
]

export default function BeautyTipsSection() {
  const [tips, setTips] = useState(DEFAULT_TIPS)
  const tipsKey = useRealtime('tips')

  useEffect(() => {
    api.get('/tips', { params: { limit: 6 } })
      .then(({ data }) => { if (data.tips?.length > 0) setTips(data.tips) })
      .catch(() => {})
  }, [tipsKey])

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="mb-12 flex items-end justify-between"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-glow-magenta">Beauty secrets</p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-white sm:text-4xl">Glow Tips & Guides</h2>
            <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-glow-magenta to-glow-purple" />
          </div>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tips.map((tip, i) => {
            const colorClass = CAT_COLORS[tip.category] || CAT_COLORS.skincare
            return (
              <motion.div
                key={tip._id || i}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                className={`group overflow-hidden rounded-2xl border bg-gradient-to-br ${colorClass} p-6 transition-shadow hover:shadow-[0_16px_48px_rgba(213,16,110,0.15)]`}
              >
                {tip.imageUrl && (
                  <div className="mb-4 -mx-6 -mt-6 h-44 overflow-hidden">
                    <img src={tip.imageUrl} alt={tip.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                )}

                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-glow-magenta capitalize">{tip.category}</span>
                  <div className="flex items-center gap-1 text-xs text-white/50">
                    <Clock size={12} />
                    <span>{tip.readTime || 2} min read</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-3xl shrink-0">{tip.emoji || '✨'}</span>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-white">{tip.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/65 line-clamp-3">{tip.content}</p>
                  </div>
                </div>

                {tip.tags?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {tip.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-white/60">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

