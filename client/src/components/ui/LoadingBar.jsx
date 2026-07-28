import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function LoadingBar() {
  const location = useLocation()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    setProgress(0)

    const t1 = setTimeout(() => setProgress(60), 50)
    const t2 = setTimeout(() => setProgress(80), 300)
    const t3 = setTimeout(() => setProgress(100), 700)
    const t4 = setTimeout(() => setVisible(false), 1000)

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [location.pathname])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed left-0 top-0 z-[300] h-[3px] origin-left"
          style={{
            background: 'linear-gradient(90deg, #D5106E, #9B2FD0, #6E3992)',
            boxShadow: '0 0 12px rgba(213, 16, 110, 0.8)',
            width: `${progress}%`,
          }}
          initial={{ width: '0%', opacity: 1 }}
          animate={{ width: `${progress}%`, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
        />
      )}
    </AnimatePresence>
  )
}

