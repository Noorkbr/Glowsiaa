import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'
import { useState } from 'react'
import { useSiteSettings } from '../../context/SiteSettingsContext'

export default function WhatsAppButton() {
  const { settings } = useSiteSettings()
  const [showTooltip, setShowTooltip] = useState(false)

  const number = (settings.whatsapp_number || '+8801711000000').replace(/[^0-9]/g, '')
  const message = encodeURIComponent('Hello! I\'m interested in your products at Glowsiaa 💄')
  const href = `https://wa.me/${number}?text=${message}`

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 16, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 16, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-midnight/95 px-4 py-3 shadow-2xl backdrop-blur-xl"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(37,211,102,0.2)' }}
          >
            <div>
              <p className="text-sm font-semibold text-white">Chat with us!</p>
              <p className="text-xs text-white/50">Usually replies instantly</p>
            </div>
            <button
              type="button"
              onClick={() => setShowTooltip(false)}
              className="rounded-full p-1 text-white/40 transition hover:text-white/70"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button */}
      <motion.a
        href={href}
        target="_blank"
        rel="noreferrer"
        onHoverStart={() => setShowTooltip(true)}
        onHoverEnd={() => setShowTooltip(false)}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.93 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl"
        style={{ background: '#25D366', boxShadow: '0 4px 24px rgba(37,211,102,0.5), 0 0 0 0 rgba(37,211,102,0.4)' }}
        aria-label="Chat on WhatsApp"
      >
        {/* Pulse rings */}
        <motion.div
          className="absolute inset-0 rounded-full bg-[#25D366]"
          animate={{ scale: [1, 1.5, 1.5], opacity: [0.6, 0, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full bg-[#25D366]"
          animate={{ scale: [1, 1.5, 1.5], opacity: [0.4, 0, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
        />
        <MessageCircle size={26} fill="white" className="relative z-10" />
      </motion.a>
    </div>
  )
}

