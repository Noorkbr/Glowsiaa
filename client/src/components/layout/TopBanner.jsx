import { useSiteSettings } from '../../context/SiteSettingsContext'

const DEFAULT_MSGS = [
  '✦ Free Delivery on Orders Above ৳999',
  '✦ 100% Authentic Premium Quality',
  '✦ New Arrivals Every Week',
  '✦ Fast Delivery Across Bangladesh',
  '✦ Secure Payments: bKash · Nagad · COD',
]

export default function TopBanner() {
  const { settings } = useSiteSettings()

  const raw = settings.top_banner_messages
  const messages = Array.isArray(raw) && raw.length > 0 ? raw : DEFAULT_MSGS

  // Triple the messages for seamless loop
  const items = [...messages, ...messages, ...messages]

  return (
    <div className="overflow-hidden py-2.5 relative"
      style={{ background: 'linear-gradient(90deg, rgba(213,16,110,0.12) 0%, rgba(110,57,146,0.15) 50%, rgba(213,16,110,0.12) 100%)', borderBottom: '1px solid rgba(213,16,110,0.2)' }}>
      {/* Left/right fade masks */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 z-10"
        style={{ background: 'linear-gradient(90deg, #05050A, transparent)' }} />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 z-10"
        style={{ background: 'linear-gradient(-90deg, #05050A, transparent)' }} />

      <div className="marquee-track flex items-center gap-0">
        {items.map((msg, i) => (
          <span key={i} className="mx-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] whitespace-nowrap"
            style={{ color: '#E5E5E5', textShadow: '0 0 12px rgba(213,16,110,0.7)' }}>
            {msg}
          </span>
        ))}
      </div>
    </div>
  )
}
