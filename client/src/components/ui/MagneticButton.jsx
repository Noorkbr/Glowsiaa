import { useRef, useCallback } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/**
 * MagneticButton — pulls toward cursor within `radius` px.
 * Pass `as="a"` or `as="div"` to change the element type.
 */
export default function MagneticButton({
  children,
  className = '',
  onClick,
  radius = 60,
  strength = 0.38,
  as: Tag = 'button',
  type,
  ...rest
}) {
  const ref  = useRef(null)
  const rafId = useRef(null)
  const x  = useMotionValue(0)
  const y  = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 20, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 260, damping: 20, mass: 0.5 })

  const handleMouseMove = useCallback((e) => {
    if (rafId.current) return           // skip if a frame is already scheduled
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const cx = rect.left + rect.width  / 2
      const cy = rect.top  + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < radius) {
        x.set(dx * strength)
        y.set(dy * strength)
      }
    })
  }, [x, y, radius, strength])

  const handleMouseLeave = useCallback(() => {
    if (rafId.current) { cancelAnimationFrame(rafId.current); rafId.current = null }
    x.set(0)
    y.set(0)
  }, [x, y])

  const MotionTag = motion[Tag] || motion.button

  return (
    <MotionTag
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      type={Tag === 'button' ? (type || 'button') : undefined}
      style={{ x: sx, y: sy }}
      className={className}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}
