import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/axios'

const SiteSettingsContext = createContext(null)

const DEFAULTS = {
  logo_url: '',
  logo_alt: 'Glowsiaa',
  top_banner_messages: [
    '🚚 Free Delivery on Orders Above ৳999',
    '✨ 100% Authentic Premium Quality',
    '💄 New Arrivals Every Week',
    "🇧🇩 Bangladesh's #1 Premium Cosmetics Store",
  ],
  announcement: '',
  announcement_active: false,
  store_name: 'Glowsiaa',
  delivery_fee_inside: 60,
  delivery_fee_outside: 120,
  free_delivery_above: 999,
  bkash_enabled: false,
  nagad_enabled: false,
  cod_enabled: true,
}

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/settings/public')
      .then(({ data }) => {
        if (data.settings) setSettings(s => ({ ...s, ...data.settings }))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo(() => ({ settings, loading }), [settings, loading])
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext)
  if (!ctx) throw new Error('useSiteSettings must be used within SiteSettingsProvider')
  return ctx
}

