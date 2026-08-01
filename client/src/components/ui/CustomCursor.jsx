import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

// Don't show custom cursor on touch/mobile devices
const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(hover: none)').matches || 'ontouchstart' in window)

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const ringRef  = useRef(null)
  const dotRef   = useRef(null)
  const hovered  = useRef(false)
  const hidden    = useRef(false)
  const clicking  = useRef(false)

  // Detect pointer capability on mount
  useEffect(() => {
    if (!isTouchDevice()) setEnabled(true)
  }, [])

  // Raw positions
  const mx = useMotionValue(-200)
  const my = useMotionValue(-200)

  // Ring trails slightly behind (loose spring)
  const rx = useSpring(mx, { stiffness: 180, damping: 22, mass: 0.6 })
  const ry = useSpring(my, { stiffness: 180, damping: 22, mass: 0.6 })

  useEffect(() => {
    if (!enabled) return

    const setHover = (val) => {
      hovered.current = val
      if (!ringRef.current || !dotRef.current) return
      const size = val ? 44 : 34
      ringRef.current.style.width  = size + 'px'
      ringRef.current.style.height = size + 'px'
      ringRef.current.style.borderColor = val
        ? 'rgba(213,16,110,0.9)'
        : 'rgba(213,16,110,0.5)'
      ringRef.current.style.boxShadow = val
        ? '0 0 16px rgba(213,16,110,0.55)'
        : '0 0 6px rgba(213,16,110,0.25)'
      dotRef.current.style.width  = val ? '10px' : '8px'
      dotRef.current.style.height = val ? '10px' : '8px'
    }

    const onMove = (e) => {
      mx.set(e.clientX)
      my.set(e.clientY)
      if (hidden.current) {
        hidden.current = false
        if (ringRef.current) ringRef.current.style.opacity = '1'
        if (dotRef.current)  dotRef.current.style.opacity  = '1'
      }
    }

    // Event delegation — single listener on document
    const onOver = (e) => {
      const el = e.target?.closest('a, button, [data-cursor], label[for], select, [role="button"]')
      setHover(Boolean(el))
    }

    const onLeave  = () => {
      hidden.current = true
      if (ringRef.current) ringRef.current.style.opacity = '0'
      if (dotRef.current)  dotRef.current.style.opacity  = '0'
    }

    const onDown = () => {
      clicking.current = true
      if (dotRef.current) { dotRef.current.style.width = '5px'; dotRef.current.style.height = '5px' }
    }
    const onUp = () => {
      clicking.current = false
      const val = hovered.current
      if (dotRef.current) { dotRef.current.style.width = val ? '10px' : '8px'; dotRef.current.style.height = val ? '10px' : '8px' }
    }

    document.addEventListener('mousemove',  onMove,  { passive: true })
    document.addEventListener('mouseover',  onOver,  { passive: true })
    document.addEventListener('mouseleave', onLeave, { passive: true })
    document.addEventListener('mousedown',  onDown,  { passive: true })
    document.addEventListener('mouseup',    onUp,    { passive: true })

    return () => {
      document.removeEventListener('mousemove',  onMove)
      document.removeEventListener('mouseover',  onOver)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mousedown',  onDown)
      document.removeEventListener('mouseup',    onUp)
    }
  }, [enabled, mx, my])

  if (!enabled) return null

  return (
    <>
      {/* Ring — trails behind */}
      <motion.div
        ref={ringRef}
        className="pointer-events-none fixed z-[9999] rounded-full"
        style={{
          left: rx,
          top:  ry,
          translateX: '-50%',
          translateY: '-50%',
          width:  34,
          height: 34,
          border: '1.5px solid rgba(213,16,110,0.5)',
          boxShadow: '0 0 6px rgba(213,16,110,0.25)',
          transition: 'width 0.15s ease, height 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
          willChange: 'transform',
        }}
      />
      {/* Dot — snaps to cursor instantly */}
      <motion.div
        ref={dotRef}
        className="pointer-events-none fixed z-[10000] rounded-full"
        style={{
          left: mx,
          top:  my,
          translateX: '-50%',
          translateY: '-50%',
          width:  8,
          height: 8,
          backgroundColor: '#D5106E',
          boxShadow: '0 0 10px 2px rgba(213,16,110,0.55)',
          transition: 'width 0.1s ease, height 0.1s ease',
          willChange: 'transform',
        }}
      />
    </>
  )
}
