import { Facebook, Instagram, Mail, Phone, Send } from 'lucide-react'
import { Link } from 'react-router-dom'

const footerColumns = [
  {
    title: 'About',
    links: [
      { label: 'Our Story', to: '/#our-story' },
      { label: 'Authenticity Promise', to: '/#our-story' },
      { label: 'Why Glowsiaa', to: '/#our-story' }
    ]
  },
  {
    title: 'Shop',
    links: [
      { label: 'All Products', to: '/products' },
      { label: 'Skincare', to: '/products?category=skincare' },
      { label: 'Makeup', to: '/products?category=makeup' },
      { label: 'Fragrance', to: '/products?category=fragrance' },
      { label: 'Haircare', to: '/products?category=haircare' }
    ]
  },
  {
    title: 'Help',
    links: [
      { label: 'Track Your Order', to: '/orders' },
      { label: 'My Account', to: '/account' },
      { label: 'Contact Us', to: '/login' }
    ]
  }
]

const socials = [
  { icon: Instagram, label: 'Instagram' },
  { icon: Facebook, label: 'Facebook' },
  { icon: Send, label: 'Messenger' }
]

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-midnight">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.5fr_repeat(4,1fr)] lg:px-8">
        <div>
          <div
            className="font-heading text-3xl font-bold tracking-[0.28em]"
            style={{
              background: 'linear-gradient(to right, #D5106E, #6E3992)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            GLOWSIAA
          </div>
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/65">
            Premium beauty essentials, globally sourced and authentically delivered to glow-getters across Bangladesh.
          </p>
          <div className="mt-6 space-y-3 text-sm text-white/70">
            <div className="flex items-center gap-3"><Phone size={16} className="text-glow-magenta" /> +880 1711-000000</div>
            <div className="flex items-center gap-3"><Mail size={16} className="text-glow-magenta" /> hello@glowsiaa.com</div>
          </div>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <h3 className="font-heading text-lg font-semibold text-white">{column.title}</h3>
            <div className="mt-4 space-y-3 text-sm text-white/65">
              {column.links.map((link) => (
                <Link key={link.label} to={link.to} className="block transition hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div>
          <h3 className="font-heading text-lg font-semibold text-white">Connect</h3>
          <div className="mt-4 flex gap-3">
            {socials.map(({ icon: Icon, label }) => (
              <button
                key={label}
                type="button"
                className="rounded-full border border-white/10 p-3 text-white/75 transition hover:border-glow-magenta/50 hover:bg-white/5 hover:text-white"
                aria-label={label}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {['bKash', 'Nagad', 'COD'].map((badge) => (
              <span key={badge} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/80">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-center text-sm text-white/45 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Glowsiaa. All rights reserved. Premium cosmetics curated for Bangladesh.
      </div>
    </footer>
  )
}
