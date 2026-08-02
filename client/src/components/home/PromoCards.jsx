import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '../../context/SiteSettingsContext'
import { useLanguage } from '../../context/LanguageContext'

// ── Default promo card data ───────────────────────────────────────────────────
const DEFAULTS = [
  { id: 'bogo',       title: 'BOGO',     subtitle: 'Buy 1\nGet 1', emoji: '🎁', link: '/products', bgFrom: '#FF85B3', bgTo: '#D5106E', active: true },
  { id: 'combo',      title: 'COMBO',    subtitle: 'Bundle\nDeals', emoji: '💎', link: '/products', bgFrom: '#FF99C2', bgTo: '#C0166E', active: true },
  { id: 'exclusives', title: ['EXCLU','SIVES'], subtitle: 'Limited\nEdition', emoji: '✨', link: '/products', bgFrom: '#FFADD3', bgTo: '#A8166A', active: true },
  { id: 'sale',       title: 'SALE',     subtitle: 'Up to\n50% Off', emoji: '🔥', link: '/products', bgFrom: '#FF80B0', bgTo: '#CC0055', active: true },
]

// ── Wavy per-letter animation ─────────────────────────────────────────────────
function WavyWord({ text, fontSize = 'clamp(2.2rem, 5.5vw, 3.8rem)', globalDelay = 0 }) {
  const lines = Array.isArray(text) ? text : text.split('\n')
  return (
    <div className="flex flex-col items-center leading-none">
      {lines.map((line, li) => (
        <div key={li} className="flex justify-center">
          {line.split('').map((char, ci) => {
            const idx = lines.slice(0, li).reduce((acc, l) => acc + l.length, 0) + ci
            return (
              <motion.span
                key={ci}
                className="inline-block font-heading font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                style={{ fontSize, lineHeight: 1.05 }}
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  delay: globalDelay + idx * 0.09,
                  ease: [0.45, 0, 0.55, 1],
                }}
              >
                {char}
              </motion.span>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ── Decorative wavy SVG strip ─────────────────────────────────────────────────
const WaveStrip = ({ flip = false, opacity = 0.2 }) => (
  <svg
    viewBox="0 0 400 40"
    className={`absolute left-0 right-0 w-full ${flip ? 'top-0 rotate-180' : 'bottom-0'}`}
    style={{ opacity }}
    preserveAspectRatio="none"
  >
    <path
      d="M0,20 C50,0 100,40 150,20 C200,0 250,40 300,20 C350,0 380,30 400,20 L400,40 L0,40 Z"
      fill="white"
    />
  </svg>
)

// ── Sparkle star ─────────────────────────────────────────────────────────────
const Sparkle = ({ size = 14, className = '' }) => (
  <motion.svg
    viewBox="0 0 24 24" width={size} height={size}
    className={`absolute fill-white/50 ${className}`}
    animate={{ rotate: 360, scale: [1, 1.3, 1] }}
    transition={{ rotate: { duration: 8, repeat: Infinity, ease: 'linear' }, scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
  >
    <path d="M12 2 L13.5 9 L20 10.5 L13.5 12 L12 19 L10.5 12 L4 10.5 L10.5 9 Z" />
  </motion.svg>
)

// ── Single promo card ─────────────────────────────────────────────────────────
function PromoCard({ title, subtitle, emoji, link, bgFrom, bgTo, index }) {
  return (
    <Link to={link}>
      <motion.div
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-center select-none"
        style={{
          background: `linear-gradient(145deg, ${bgFrom} 0%, ${bgTo} 100%)`,
          aspectRatio: '1 / 1',
          boxShadow: `0 8px 32px ${bgTo}55, 0 2px 8px rgba(0,0,0,0.2)`,
          border: '1px solid rgba(255,255,255,0.25)',
          padding: 'clamp(16px, 4vw, 28px)',
        }}
        whileHover={{ scale: 1.04, y: -4 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition2={{ delay: index * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Wave decorations */}
        <WaveStrip opacity={0.18} />
        <WaveStrip flip opacity={0.12} />

        {/* Background circle glow */}
        <div className="absolute inset-0 rounded-full blur-2xl opacity-30 scale-75"
          style={{ background: 'rgba(255,255,255,0.5)' }} />

        {/* Sparkles */}
        <Sparkle size={12} className="top-3 right-4" />
        <Sparkle size={8}  className="top-6 left-3" />
        <Sparkle size={10} className="bottom-5 left-5" />
        <Sparkle size={7}  className="bottom-4 right-6" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-1">
          <motion.span
            className="text-2xl sm:text-3xl"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.3 }}
          >
            {emoji}
          </motion.span>

          <WavyWord text={title} globalDelay={index * 0.2} />

          <div className="mt-1">
            {(subtitle || '').split('\n').map((line, i) => (
              <p key={i} className="text-white/80 font-semibold leading-tight"
                style={{ fontSize: 'clamp(0.65rem, 1.8vw, 0.9rem)' }}>
                {line}
              </p>
            ))}
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function PromoCards() {
  const { settings } = useSiteSettings()
  const { t } = useLanguage()

  const raw = settings.promo_cards
  const cards = Array.isArray(raw) && raw.length > 0 ? raw : DEFAULTS
  const activeCards = cards.filter(c => c.active !== false)
  if (!activeCards.length) return null

  return (
    <section className="px-3 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        {/* Section label */}
        <motion.div
          className="mb-6 sm:mb-8 flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-0.5 w-6 rounded-full bg-glow-magenta" />
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-glow-magenta">{t('specialOffers')}</p>
          <div className="h-0.5 flex-1 rounded-full bg-glow-magenta/20" />
        </motion.div>

        {/* Cards grid */}
        <div className={`grid gap-3 sm:gap-4 lg:gap-5 ${
          activeCards.length === 4 ? 'grid-cols-2 lg:grid-cols-4' :
          activeCards.length === 3 ? 'grid-cols-2 sm:grid-cols-3' :
          activeCards.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
        }`}>
          {activeCards.map((card, i) => (
            <PromoCard key={card.id} {...card} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

