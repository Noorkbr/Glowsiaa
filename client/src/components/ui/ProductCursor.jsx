import { useEffect, useRef } from 'react'

/**
 * Lightweight custom cursor for product pages.
 * Uses requestAnimationFrame + direct DOM manipulation — zero physics overhead.
 * Shows a small magenta dot that follows the mouse precisely.
 */
export default function ProductCursor() {
  const dotRef = useRef(null)
  const rafRef = useRef(null)
  const pos = useRef({ x: -200, y: -200 })
  const visible = useRef(false)

  useEffect(() => {
    // Hide native cursor on the product page only
    document.body.style.cursor = 'none'

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (!visible.current) {
        visible.current = true
        if (dotRef.current) dotRef.current.style.opacity = '1'
      }
    }

    const onLeave = () => {
      visible.current = false
      if (dotRef.current) dotRef.current.style.opacity = '0'
    }

    const onEnter = () => {
      visible.current = true
      if (dotRef.current) dotRef.current.style.opacity = '1'
    }

    const render = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x - 6}px, ${pos.current.y - 6}px)`
      }
      rafRef.current = requestAnimationFrame(render)
    }

    document.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave, { passive: true })
    document.addEventListener('mouseenter', onEnter, { passive: true })
    rafRef.current = requestAnimationFrame(render)

    return () => {
      document.body.style.cursor = ''
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: '#D5106E',
        boxShadow: '0 0 10px 3px rgba(213,16,110,0.5)',
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: 0,
        willChange: 'transform',
        transition: 'opacity 0.2s ease',
      }}
    />
  )
}

