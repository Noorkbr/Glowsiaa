import { motion, useScroll, useSpring } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 400, damping: 40 })

  return (
    <motion.div
      className="fixed left-0 top-0 z-[299] h-[2px] origin-left"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, #D5106E 0%, #9B2FD0 50%, #6E3992 100%)',
        boxShadow: '0 0 8px rgba(213, 16, 110, 0.5)',
      }}
    />
  )
}

