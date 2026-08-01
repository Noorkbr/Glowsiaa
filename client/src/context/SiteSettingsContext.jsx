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

  useEffect(() => {
    api.get('/settings/public')
      .then(({ data }) => {
        if (data.settings) setSettings(s => ({ ...s, ...data.settings }))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const refresh = useCallback(() => {
    api.get('/settings/public')
      .then(({ data }) => { if (data.settings) setSettings(s => ({ ...s, ...data.settings })) })
      .catch(() => {})
  }, [])

  const value = useMemo(() => ({ settings, loading, refresh }), [settings, loading, refresh])
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext)
  if (!ctx) throw new Error('useSiteSettings must be used within SiteSettingsProvider')
  return ctx
}
