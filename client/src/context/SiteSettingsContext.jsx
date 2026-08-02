import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/axios'

const SiteSettingsContext = createContext(null)

export const DEFAULTS = {
  logo_url: '',
  favicon_url: '',
  logo_alt: 'Glowsiaa',
  store_name: 'Glowsiaa',
  store_tagline: 'Glow Like Never Before',
  store_description: "Bangladesh's premier destination for authentic luxury cosmetics.",
  support_email: 'hello@glowsiaa.com',
  support_phone: '+880 1711-000000',
  whatsapp_number: '+8801711000000',
  store_address: 'Dhaka, Bangladesh',
  footer_copyright: '© 2026 Glowsiaa. All rights reserved.',
  primary_color: '#D5106E',
  secondary_color: '#6E3992',
  top_banner_messages: [
    '🚚 Free Delivery on Orders Above ৳999',
    '✨ 100% Authentic Premium Quality',
    '💄 New Arrivals Every Week',
    "🇧🇩 Bangladesh's #1 Premium Cosmetics Store",
  ],
  announcement: '',
  announcement_active: false,
  delivery_fee_inside: 60,
  delivery_fee_outside: 120,
  free_delivery_above: 999,
  bkash_enabled: false,
  nagad_enabled: false,
  rocket_enabled: false,
  cod_enabled: true,
  bkash_merchant_number: '',
  nagad_merchant_number: '',
  rocket_merchant_number: '',
  seo_title: 'Glowsiaa — Premium Beauty in Bangladesh',
  seo_description: 'Premium cosmetics curated for the modern Bangladeshi woman. 100% authentic.',
  social_facebook: '',
  social_instagram: '',
  social_tiktok: '',
  social_youtube: '',
  social_twitter: '',
  social_pinterest: '',
  social_linkedin: '',
  promo_cards: [],
  facebook_pixel_id: '',
  facebook_pixel_enabled: false,
}

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)

  const fetchSettings = useCallback(() => {
    return api.get('/settings/public')
      .then(({ data }) => { if (data.settings) setSettings(s => ({ ...s, ...data.settings })) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    // Initial load
    fetchSettings().finally(() => setLoading(false))

    // Re-fetch whenever the user returns to this tab (picks up admin changes instantly)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchSettings()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // Also poll every 30 seconds so long-open tabs stay in sync
    const interval = setInterval(fetchSettings, 30_000)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      clearInterval(interval)
    }
  }, [fetchSettings])

  const value = useMemo(() => ({ settings, loading, refresh: fetchSettings }), [settings, loading, fetchSettings])
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext)
  if (!ctx) throw new Error('useSiteSettings must be used within SiteSettingsProvider')
  return ctx
}
