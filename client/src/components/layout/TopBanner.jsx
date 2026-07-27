import { motion } from 'framer-motion'

const messages = [
  '🚚 Free Delivery on Orders Above ৳999',
  '✨ 100% Authentic Premium Quality',
  '💄 New Arrivals Every Week',
  "🇧🇩 Bangladesh's #1 Premium Cosmetics Store"
]

export default function TopBanner() {
  const tickerMessages = [...messages, ...messages]

  return (
    <div className="overflow-hidden bg-gradient-to-r from-[#D5106E] to-[#6E3992] py-2">
      <motion.div
        className="flex w-max items-center gap-8 whitespace-nowrap px-4 text-xs font-medium tracking-wide text-white sm:text-sm"
        animate={{ x: [0, -1000] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        {tickerMessages.map((message, index) => (
          <span key={`${message}-${index}`} className="opacity-95">
            {message}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
