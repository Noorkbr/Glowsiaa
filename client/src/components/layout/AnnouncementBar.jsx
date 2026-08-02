import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useState } from 'react'
import { useSiteSettings } from '../../context/SiteSettingsContext'

export default function AnnouncementBar() {
  const { settings } = useSiteSettings()
  const [dismissed, setDismissed] = useState(false)

  const visible = !dismissed && settings.announcement_active && !!settings.announcement

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden bg-gradient-to-r from-glow-purple via-glow-magenta to-glow-purple bg-[length:200%] gradient-shift"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
            <div className="flex-1 text-center text-sm font-medium text-white">
              {settings.announcement}
            </div>
            <button type="button" onClick={() => setDismissed(true)}
              className="ml-4 rounded-full p-1 text-white/70 transition hover:bg-white/15 hover:text-white"
              aria-label="Dismiss announcement">
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
