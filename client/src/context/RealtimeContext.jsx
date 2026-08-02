/**
 * RealtimeContext
 * ───────────────
 * Opens ONE persistent SSE connection to /api/events.
 * On every typed event from the server, increments a counter for that type.
 * Components call useRealtime('products') etc. and put the returned key in
 * their useEffect deps array — they re-fetch automatically whenever the admin
 * changes that resource.
 *
 * Supported types: settings | banners | products | categories | tips | coupons
 */

import { createContext, useContext, useEffect, useRef, useState } from 'react'

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : import.meta.env.DEV
    ? '/api'
    : 'https://glowsiaa-production.up.railway.app/api'

const SSE_URL = `${BASE_URL}/events`

const RealtimeContext = createContext({})

export function RealtimeProvider({ children, onSettings }) {
  // Each key is a counter; incrementing it triggers re-renders in subscribers
  const [counters, setCounters] = useState({
    settings: 0, banners: 0, products: 0, categories: 0, tips: 0, coupons: 0,
  })

  const onSettingsRef = useRef(onSettings)
  useEffect(() => { onSettingsRef.current = onSettings }, [onSettings])

  useEffect(() => {
    let es
    let reconnectTimer

    const connect = () => {
      es = new EventSource(SSE_URL)

      // Handle typed events
      const TYPES = ['settings', 'banners', 'products', 'categories', 'tips', 'coupons']
      TYPES.forEach((type) => {
        es.addEventListener(type, (e) => {
          if (type === 'settings') {
            // Pass settings data up to SiteSettingsContext via callback
            try {
              const data = JSON.parse(e.data)
              onSettingsRef.current?.(data)
            } catch { /* ignore */ }
          }
          setCounters((prev) => ({ ...prev, [type]: prev[type] + 1 }))
        })
      })

      es.onerror = () => {
        es.close()
        reconnectTimer = setTimeout(connect, 5_000)
      }
    }

    connect()

    return () => {
      es?.close()
      clearTimeout(reconnectTimer)
    }
  }, [])

  return (
    <RealtimeContext.Provider value={counters}>
      {children}
    </RealtimeContext.Provider>
  )
}

/** Returns an incrementing key for the given resource type. Put it in useEffect deps. */
export function useRealtime(type) {
  return useContext(RealtimeContext)[type] ?? 0
}

