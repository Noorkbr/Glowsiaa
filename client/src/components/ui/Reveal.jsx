import { motion } from 'framer-motion'

const directions = {
  up:    { initial: { opacity: 0, y: 48,  filter: 'blur(4px)' }, animate: { opacity: 1, y: 0,  filter: 'blur(0px)' } },
  down:  { initial: { opacity: 0, y: -36, filter: 'blur(4px)' }, animate: { opacity: 1, y: 0,  filter: 'blur(0px)' } },
  left:  { initial: { opacity: 0, x: 48,  filter: 'blur(4px)' }, animate: { opacity: 1, x: 0,  filter: 'blur(0px)' } },
  right: { initial: { opacity: 0, x: -48, filter: 'blur(4px)' }, animate: { opacity: 1, x: 0,  filter: 'blur(0px)' } },
  scale: { initial: { opacity: 0, scale: 0.88, filter: 'blur(4px)' }, animate: { opacity: 1, scale: 1, filter: 'blur(0px)' } },
}

export default function Reveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  margin = '-60px',
  className = '',
}) {
  const variant = directions[direction] || directions.up
  return (
    <motion.div
      initial={variant.initial}
      whileInView={variant.animate}
      viewport={{ once: true, margin }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

