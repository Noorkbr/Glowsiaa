import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const [hovered, setHovered] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [clicking, setClicking] = useState(false)

  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)

  // Tight spring for the dot
  const dotX = useSpring(mouseX, { stiffness: 800, damping: 28 })
  const dotY = useSpring(mouseY, { stiffness: 800, damping: 28 })

  // Loose spring for the ring (trail effect)
  const ringX = useSpring(mouseX, { stiffness: 200, damping: 22 })
  const ringY = useSpring(mouseY, { stiffness: 200, damping: 22 })

  useEffect(() => {
    const moveCursor = (e) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      setHidden(false)
    }
    const handleMouseLeave = () => setHidden(true)
    const handleMouseDown = () => setClicking(true)
    const handleMouseUp = () => setClicking(false)

    const handleHover = () => setHovered(true)
    const handleUnhover = () => setHovered(false)

    window.addEventListener('mousemove', moveCursor)
    document.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)

    // Detect hoverable elements
    const interactiveEls = document.querySelectorAll('a, button, [data-cursor]')
    interactiveEls.forEach(el => {
      el.addEventListener('mouseenter', handleHover)
      el.addEventListener('mouseleave', handleUnhover)
    })

    // MutationObserver to attach to dynamically added elements
    const observer = new MutationObserver(() => {
      document.querySelectorAll('a, button, [data-cursor]').forEach(el => {
        el.addEventListener('mouseenter', handleHover)
        el.addEventListener('mouseleave', handleUnhover)
      })
    })
    observer.observe(document.body, { subtree: true, childList: true })

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      observer.disconnect()
    }
  }, [mouseX, mouseY])

  return (
    <>
      {/* Outer ring — trails behind */}
      <motion.div
        className="pointer-events-none fixed z-[9999] rounded-full"
        style={{
          left: ringX,
          top: ringY,
          translateX: '-50%',
          translateY: '-50%',
          width:  hovered ? 48 : 36,
          height: hovered ? 48 : 36,
          border: `1.5px solid ${hovered ? 'rgba(213,16,110,0.9)' : 'rgba(213,16,110,0.45)'}`,
          boxShadow: hovered ? '0 0 16px rgba(213,16,110,0.6)' : '0 0 6px rgba(213,16,110,0.3)',
          opacity: hidden ? 0 : 1,
          transition: 'width 0.18s ease, height 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
        }}
      />

      {/* Inner dot — snaps precisely */}
      <motion.div
        className="pointer-events-none fixed z-[10000] rounded-full"
        style={{
          left: dotX,
          top:  dotY,
          translateX: '-50%',
          translateY: '-50%',
          width:           clicking ? 6 : hovered ? 10 : 8,
          height:          clicking ? 6 : hovered ? 10 : 8,
          backgroundColor: '#D5106E',
          boxShadow:       hovered
            ? '0 0 20px 4px rgba(213,16,110,0.8)'
            : '0 0 10px 2px rgba(213,16,110,0.55)',
          opacity: hidden ? 0 : 1,
          transition: 'width 0.12s ease, height 0.12s ease',
          mixBlendMode: 'normal',
        }}
      />
    </>
  )
}

