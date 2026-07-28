import { motion } from 'framer-motion'
import { Facebook, Instagram, Mail, MapPin, Phone, Send, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const footerLinks = [
  {
    title: 'Shop',
    links: [
      { label: 'All Products', to: '/products' },
      { label: 'Skincare', to: '/products?category=skincare' },
      { label: 'Makeup', to: '/products?category=makeup' },
      { label: 'Fragrance', to: '/products?category=fragrance' },
      { label: 'Haircare', to: '/products?category=haircare' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Our Story', to: '/#our-story' },
      { label: 'Authenticity Promise', to: '/#our-story' },
      { label: 'Beauty Tips', to: '/#our-story' },
      { label: 'Careers', to: '/' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Track Order', to: '/orders' },
      { label: 'My Account', to: '/account' },
      { label: 'Returns Policy', to: '/' },
      { label: 'FAQ', to: '/' },
    ],
  },
]

const socials = [
  { icon: Instagram, label: 'Instagram', href: '#', color: 'hover:text-pink-400' },
  { icon: Facebook, label: 'Facebook', href: '#', color: 'hover:text-blue-400' },
  { icon: Send, label: 'Messenger', href: '#', color: 'hover:text-cyan-400' },
]

const LinkItem = ({ to, label }) => (
  <Link to={to} className="group flex items-center gap-1.5 text-sm text-white/55 transition-all duration-200 hover:translate-x-1 hover:text-white">
    <ArrowRight size={12} className="opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
    {label}
  </Link>
)

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubscribed(true)
    setEmail('')
  }

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-midnight">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-[400px] w-[400px] rounded-full bg-glow-magenta/8 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-20 right-1/4 h-[300px] w-[300px] rounded-full bg-glow-purple/8 blur-[80px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Newsletter strip */}
        <div className="border-b border-white/10 py-10">
          <motion.div
            className="flex flex-col items-center gap-6 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h3 className="font-heading text-2xl font-bold text-white">
                Get the glow-up newsletter ✨
              </h3>
              <p className="mt-1 text-sm text-white/55">
                Beauty tips, exclusive deals & new arrivals — straight to your inbox.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full max-w-md gap-3">
              {subscribed ? (
                <motion.p
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full text-center text-sm font-semibold text-emerald-400"
                >
                  🎉 You&apos;re on the list! Check your inbox.
                </motion.p>
              ) : (
                <>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-glow-magenta focus:ring-2 focus:ring-glow-magenta/20"
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="shrink-0 rounded-full bg-glow-magenta px-6 py-3 text-sm font-semibold text-white"
                    style={{ boxShadow: '0 0 24px rgba(213,16,110,0.4)' }}
                  >
                    Subscribe
                  </motion.button>
                </>
              )}
            </form>
          </motion.div>
        </div>

        {/* Main footer grid */}
        <div className="py-12 grid gap-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-[1.6fr_repeat(3,1fr)_1.2fr] lg:gap-10 lg:py-14">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link to="/" className="inline-block font-heading text-3xl font-black tracking-[0.28em]"
              style={{ background: 'linear-gradient(135deg, #D5106E, #9B2FD0, #6E3992)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              GLOWSIAA
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-7 text-white/55">
              Bangladesh&apos;s premier destination for authentic luxury cosmetics. Premium beauty, delivered with love.
            </p>

            <div className="mt-6 space-y-3 text-sm text-white/60">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-glow-magenta/15">
                  <Phone size={14} className="text-glow-magenta" />
                </div>
                +880 1711-000000
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-glow-magenta/15">
                  <Mail size={14} className="text-glow-magenta" />
                </div>
                hello@glowsiaa.com
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-glow-magenta/15">
                  <MapPin size={14} className="text-glow-magenta" />
                </div>
                Dhaka, Bangladesh
              </div>
            </div>

            {/* Social */}
            <div className="mt-6 flex gap-2">
              {socials.map(({ icon: Icon, label, href, color }) => (
                <motion.a
                  key={label}
                  href={href}
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition ${color}`}
                  aria-label={label}
                >
                  <Icon size={17} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h3 className="mb-5 font-heading text-sm font-bold uppercase tracking-[0.2em] text-white">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map(link => (
                  <li key={link.label}>
                    <LinkItem {...link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Payment & trust */}
          <div>
            <h3 className="mb-5 font-heading text-sm font-bold uppercase tracking-[0.2em] text-white">
              We Accept
            </h3>
            <div className="flex flex-wrap gap-2">
              {['bKash', 'Nagad', 'COD'].map(badge => (
                <span key={badge}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/70">
                  {badge}
                </span>
              ))}
            </div>
            <div className="mt-6 space-y-2">
              {([
                { emoji: '✅', text: '100% Authentic Products' },
                { emoji: '🚚', text: 'Free delivery above ৳999' },
                { emoji: '🔒', text: 'Secure & encrypted checkout' },
                { emoji: '↩️', text: '7-day easy returns' },
              ]).map(({ emoji, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-white/50">
                  <span>{emoji}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-white/35 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Glowsiaa. All rights reserved. Premium cosmetics for Bangladesh.</p>
          <div className="flex items-center gap-4">
            <Link to="/" className="transition hover:text-white/60">Privacy Policy</Link>
            <Link to="/" className="transition hover:text-white/60">Terms of Service</Link>
            <span>Made with ❤️ in Bangladesh</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
