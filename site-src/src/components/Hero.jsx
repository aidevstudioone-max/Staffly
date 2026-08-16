import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { IconPeople, IconCheck, IconClock, IconBriefcase } from './Icons.jsx'

const rise = (delay) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] } })

const ROWS = [
  { name: 'Aditi Rao', dept: 'Design', status: 'In', tone: 'bg-green/10 text-green' },
  { name: 'Marcus Lee', dept: 'Engineering', status: 'In', tone: 'bg-green/10 text-green' },
  { name: 'Priya Nair', dept: 'Sales', status: 'On Leave', tone: 'bg-amber/10 text-amber' },
]

export default function Hero() {
  const cardRef = useRef(null)
  useEffect(() => {
    if (cardRef.current) gsap.to(cardRef.current, { y: -10, duration: 4.5, repeat: -1, yoyo: true, ease: 'sine.inOut' })
  }, [])

  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-20 md:pt-36">
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-24 h-[440px] w-[440px] rounded-full opacity-70 blur-[10px]" style={{ background: 'radial-gradient(circle, rgba(79,70,229,.16), rgba(79,70,229,0) 65%)' }} />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2">
        <div>
          <motion.span {...rise(0)} className="mb-5 inline-flex items-center gap-2 rounded-full bg-indigo-light px-3.5 py-1.5 font-sans text-[.72rem] font-semibold uppercase tracking-[.07em] text-indigo">
            <IconPeople width={14} height={14} /> Employee Management, Simplified
          </motion.span>
          <h1 className="mb-5 max-w-xl font-display text-[clamp(2.1rem,5vw,3.4rem)] font-bold leading-[1.1] tracking-tight text-balance">
            <motion.span {...rise(0.06)} className="block">One dashboard for your</motion.span>
            <motion.span {...rise(0.14)} className="block text-indigo">whole team.</motion.span>
          </h1>
          <motion.p {...rise(0.24)} className="mb-8 max-w-[46ch] text-[1.08rem] leading-relaxed text-ink-soft text-pretty">
            Staffly keeps your employee directory, attendance, and leave requests in one clean place — so HR stops living in spreadsheets and email threads.
          </motion.p>
          <motion.div {...rise(0.32)} className="mb-9 flex flex-wrap gap-3">
            <a href="app.html" className="inline-flex items-center gap-2 rounded-lg bg-indigo px-6 py-3.5 font-semibold text-white shadow-[0_10px_22px_rgba(79,70,229,.28)] transition-transform hover:-translate-y-0.5">
              Try Live Demo <IconBriefcase width={17} height={17} />
            </a>
            <a href="#features" className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-6 py-3.5 font-semibold text-ink transition-colors hover:border-indigo hover:bg-indigo-light">
              See Features
            </a>
          </motion.div>
          <motion.div {...rise(0.4)} className="flex flex-wrap gap-x-6 gap-y-2 text-[.88rem] font-medium text-ink-soft">
            <span className="inline-flex items-center gap-2"><IconPeople width={16} height={16} /> 10 seeded employees</span>
            <span className="inline-flex items-center gap-2"><IconCheck width={16} height={16} /> One-click attendance</span>
            <span className="inline-flex items-center gap-2"><IconClock width={16} height={16} /> No setup required</span>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}>
          <div ref={cardRef} className="rounded-2xl border border-border bg-surface p-6 shadow-[0_30px_70px_-30px_rgba(55,48,163,.35)]">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-display text-[1.02rem] font-semibold">Today's attendance</h4>
              <span className="rounded-full bg-indigo-light px-3 py-1 font-mono text-[.68rem] font-semibold text-indigo">Live</span>
            </div>
            {ROWS.map((r, i) => (
              <motion.div key={r.name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }} className="flex items-center gap-3 border-t border-border py-3.5 first:border-t-0">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-light font-display text-[.78rem] font-bold text-indigo">{r.name.split(' ').map((n) => n[0]).join('')}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[.92rem] font-semibold">{r.name}</div>
                  <div className="text-[.78rem] text-ink-soft">{r.dept}</div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 font-mono text-[.72rem] font-semibold ${r.tone}`}>{r.status}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
