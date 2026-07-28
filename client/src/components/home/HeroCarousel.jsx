import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { ArrowRight, Play, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import api from '../../api/axios'
import MagneticButton from '../ui/MagneticButton'

const DEFAULT = {
  headline: ['Glow', 'Like Never', 'Before'],
  sub: 'Premium cosmetics curated for the modern Bangladeshi woman. Authentic. Fast. Yours.',
  badge: 'New Collection 2026',
  buttonText: 'Explore Collection',
  buttonLink: '/products',
  imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=700&q=90',
}

const Blob = ({ className, size = 600, delay = 0 }) => (
  <motion.div
    className={`absolute rounded-full blur-[130px] pointer-events-none ${className}`}
    style={{ width: size, height: size }}
    animate={{ x: [0, 80, -50, 30, 0], y: [0, -60, 40, -30, 0], scale: [1, 1.18, 0.88, 1.05, 1] }}
    transition={{ duration: 18 + delay * 3, repeat: Infinity, ease: 'easeInOut', delay }}
  />
)

const WORD_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.2 } },
}
const WORD_CHILD = {
  hidden: { opacity: 0, y: 52, filter: 'blur(12px)', rotate: -3 },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', rotate: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
}

function HeadlineReveal({ lines }) {
  return (
    <motion.h1
      variants={WORD_VARIANTS}
      initial="hidden"
      animate="visible"
      className="font-heading font-extrabold leading-[0.95] tracking-tight text-white"
      style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
    >
      {lines.map((line, li) => (
        <span key={li} className="block overflow-hidden pb-1">
          {line.split(' ').map((word, wi) => (
            <motion.span key={wi} variants={WORD_CHILD} className="inline-block mr-[0.25em]">
              {li === 0
                ? <span className="text-gradient-glow">{word}</span>
                : word}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.h1>
  )
}

function ParallaxProduct({ imageUrl, alt = 'Product' }) {
  const containerRef = useRef(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 180, damping: 18 })
  const sry = useSpring(ry, { stiffness: 180, damping: 18 })

  const onMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    rx.set(((e.clientY - rect.top)  / rect.height - 0.5) * -18)
    ry.set(((e.clientX - rect.left) / rect.width  - 0.5) *  18)
  }
  const onMouseLeave = () => { rx.set(0); ry.set(0) }

  return (
    <div ref={containerRef} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
      className="relative flex items-center justify-center" style={{ perspective: '1200px' }}>
      <div className="absolute inset-0 rounded-full bg-glow-magenta/35 blur-[100px] scale-75 pointer-events-none" />
      <motion.div className="absolute rounded-full pointer-events-none"
        animate={{ rotate: 360 }} transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        style={{ width: '110%', height: '110%', background: 'conic-gradient(from 0deg, transparent 75%, rgba(213,16,110,0.5) 100%)' }} />
      <motion.div className="absolute rounded-full pointer-events-none"
        animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        style={{ width: '95%', height: '95%', background: 'conic-gradient(from 180deg, transparent 80%, rgba(110,57,146,0.38) 100%)' }} />

      <motion.div
        style={{ rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d' }}
        animate={{ y: [-14, 14, -14] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.04 }}
        className="relative z-10"
      >
        <div className="overflow-hidden rounded-[2.5rem] shadow-[0_40px_120px_rgba(0,0,0,0.85)]"
          style={{ border: '1px solid rgba(213,16,110,0.22)', background: 'rgba(255,255,255,0.03)', padding: '16px' }}>
          <img src={imageUrl} alt={alt} className="rounded-[2rem] object-cover"
            style={{ width: 'clamp(200px, 22vw, 340px)', height: 'clamp(260px, 30vw, 460px)' }} />
        </div>
        <motion.div className="glass-magenta absolute bottom-8 left-6 rounded-2xl px-4 py-3"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}
          style={{ transform: 'translateZ(40px)' }}>
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">Trending</p>
          <p className="mt-0.5 text-sm font-bold text-white">Vitamin C Serum</p>
          <p className="text-xs text-glow-magenta font-semibold mt-0.5">৳1,450</p>
        </motion.div>
        <motion.div className="absolute -right-3 -top-3 rounded-full bg-glow-magenta p-2"
          animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ boxShadow: '0 0 20px rgba(213,16,110,0.8)' }}>
          <Sparkles size={14} className="text-white" />
        </motion.div>
      </motion.div>
    </div>
  )
}

const StatItem = ({ value, label, delay }) => (
  <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
    <div className="font-heading text-3xl font-black"
      style={{ background: 'linear-gradient(135deg,#D5106E,#9B2FD0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
      {value}
    </div>
    <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/45">{label}</div>
  </motion.div>
)

export default function HeroCarousel() {
  const [banners, setBanners] = useState([])
  const [current, setCurrent] = useState(0)
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const blobY = useTransform(scrollYProgress, [0, 1], ['0%', '28%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-10%'])

  useEffect(() => {
    api.get('/banners', { params: { type: 'hero' } })
      .then(({ data }) => { if (data.banners?.length > 0) setBanners(data.banners) })
      .catch(() => {})
  }, [])
  useEffect(() => {
    if (banners.length <= 1) return
    const t = setInterval(() => setCurrent(c => (c + 1) % banners.length), 6000)
    return () => clearInterval(t)
  }, [banners.length])

  const b = banners[current]
  const content = {
    headline:   b?.title ? b.title.split(' | ') : DEFAULT.headline,
    sub:        b?.subtitle || DEFAULT.sub,
    badge:      b?.badgeText || DEFAULT.badge,
    buttonText: b?.buttonText || DEFAULT.buttonText,
    buttonLink: b?.buttonLink || DEFAULT.buttonLink,
    imageUrl:   b?.imageUrl  || DEFAULT.imageUrl,
  }

  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden bg-midnight">
      <motion.div style={{ y: blobY }} className="pointer-events-none absolute inset-0 overflow-hidden">
        <Blob className="bg-glow-magenta/28 top-[-8%] right-[-4%]"  size={700} delay={0} />
        <Blob className="bg-glow-purple/22 bottom-[-6%] left-[-6%]" size={620} delay={2} />
        <Blob className="bg-glow-magenta/14 top-[35%] left-[32%]"   size={360} delay={4} />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 dot-grid opacity-35" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-4 py-24 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-0">
        <motion.div style={{ y: textY }} className="flex flex-col justify-center order-2 lg:order-1">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex w-fit items-center gap-2.5 rounded-full px-4 py-2 glass-magenta">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-glow-magenta opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-glow-magenta" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-glow-magenta">{content.badge}</span>
          </motion.div>

          <HeadlineReveal lines={content.headline} />

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.55 }}
            className="mt-5 max-w-lg text-base leading-7 text-white/60 sm:text-xl sm:leading-8">
            {content.sub}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mt-8 flex flex-wrap gap-3">
            <MagneticButton as="div"
              className="btn-shimmer inline-flex items-center gap-2 rounded-full bg-glow-magenta px-7 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-white transition-transform hover:-translate-y-1 sm:px-9 sm:py-4"
              style={{ boxShadow: '0 0 40px rgba(213,16,110,0.5), 0 0 80px rgba(213,16,110,0.2)' }}
              onClick={() => window.location.href = content.buttonLink}>
              {content.buttonText}
              <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
                <ArrowRight size={16} />
              </motion.span>
            </MagneticButton>
            <MagneticButton
              className="glass inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.18em] text-white/75 transition hover:text-white sm:px-8"
              onClick={() => document.getElementById('our-story')?.scrollIntoView({ behavior: 'smooth' })}>
              <Play size={13} className="fill-white/55" />
              Our Story
            </MagneticButton>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
            className="mt-10 flex items-center gap-6 sm:gap-10">
            <StatItem value="10K+" label="Customers" delay={1.15} />
            <div className="h-8 w-px bg-white/10" />
            <StatItem value="100%" label="Authentic" delay={1.25} />
            <div className="h-8 w-px bg-white/10" />
            <StatItem value="2–5d" label="Delivery" delay={1.35} />
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.84 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center order-1 lg:order-2">
          <ParallaxProduct imageUrl={content.imageUrl} />
        </motion.div>
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
          {banners.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-500 ${i === current ? 'w-8 bg-glow-magenta shadow-glow-magenta' : 'w-2 bg-white/20 hover:bg-white/40'}`} />
          ))}
        </div>
      )}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-midnight to-transparent" />
    </section>
  )
}
