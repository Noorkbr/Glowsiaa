import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../../api/axios'

export default function AnnouncementBar() {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    api.get('/settings/public')
      .then(({ data }) => {
        const s = data.settings
        if (s.announcement_active && s.announcement) {
          setMessage(s.announcement)
          setVisible(true)
        }
      })
      .catch(() => {})
  }, [])

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
              {message}
            </div>
            <button type="button" onClick={() => setVisible(false)}
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

