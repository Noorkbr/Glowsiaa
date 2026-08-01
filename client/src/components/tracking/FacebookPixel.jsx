import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useSiteSettings } from '../../context/SiteSettingsContext'

/**
 * Injects the Facebook Pixel base code once and fires PageView on every route change.
 * Pixel ID + enabled flag are stored in site settings (admin → Pixels & Tracking tab).
 *
 * Additional standard events can be fired from anywhere via:
 *   window.fbq && window.fbq('track', 'AddToCart', { value: 299, currency: 'BDT' })
 */
export default function FacebookPixel() {
  const { settings } = useSiteSettings()
  const location = useLocation()
  const pixelId = settings.facebook_pixel_id
  const enabled = !!settings.facebook_pixel_enabled

  /* ── Initialise pixel once ── */
  useEffect(() => {
    if (!enabled || !pixelId) return

    /* Skip if already initialised */
    if (window.fbq) {
      window.fbq('init', pixelId)
      window.fbq('track', 'PageView')
      return
    }

    /* Base code — identical to the snippet Facebook provides */
    ;(function (f, b, e, v, n, t, s) {
      if (f.fbq) return
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
      }
      if (!f._fbq) f._fbq = n
      n.push = n
      n.loaded = true
      n.version = '2.0'
      n.queue = []
      t = b.createElement(e)
      t.async = true
      t.src = v
      s = b.getElementsByTagName(e)[0]
      s.parentNode.insertBefore(t, s)
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')

    window.fbq('init', pixelId)
    window.fbq('track', 'PageView')
  }, [pixelId, enabled]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Fire PageView on every route change ── */
  useEffect(() => {
    if (!enabled || !pixelId || typeof window.fbq !== 'function') return
    window.fbq('track', 'PageView')
  }, [location.pathname, pixelId, enabled])

  /* Render noscript fallback into the DOM */
  if (!enabled || !pixelId) return null

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  )
}

