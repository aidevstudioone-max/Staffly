import { motion } from 'framer-motion'
import Reveal, { RevealStagger, staggerItem } from './Reveal.jsx'
import { IconPeople, IconCheck, IconCalendar, IconChart, IconBriefcase, IconPlus } from './Icons.jsx'

const FEATURES = [
  { icon: IconPeople, title: 'Employee directory', body: 'Every employee, their role, and department — searchable and always up to date.' },
  { icon: IconCheck, title: 'One-click attendance', body: 'Mark present, absent, or on leave with a single click on a clean weekly grid.' },
  { icon: IconCalendar, title: 'Leave request workflow', body: 'Employees request time off, managers approve or reject — no more email chains.' },
  { icon: IconChart, title: 'Real-time dashboard', body: "Headcount, who's in today, and who's out — the moment you open the app." },
  { icon: IconBriefcase, title: 'Department insights', body: 'See your team broken down by department at a glance.' },
  { icon: IconPlus, title: 'Instant onboarding', body: 'Add a new hire to the directory in seconds — no paperwork required.' },
]

export default function Features() {
  return (
    <section id="features" className="border-t border-border py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto mb-14 max-w-[54ch] text-center">
          <span className="mb-4 inline-block rounded-full bg-indigo-light px-3.5 py-1.5 font-sans text-[.72rem] font-semibold uppercase tracking-[.07em] text-indigo">Features</span>
          <h2 className="mb-4 font-display text-[clamp(1.8rem,3.6vw,2.5rem)] font-semibold leading-[1.15] tracking-tight">Everything HR needs, without the overhead.</h2>
        </Reveal>
        <RevealStagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <motion.div key={title} variants={staggerItem} whileHover={{ y: -6 }} className="rounded-xl border border-border bg-surface p-6 transition-shadow hover:shadow-[0_20px_40px_-25px_rgba(55,48,163,.35)]">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-indigo-light text-indigo"><Icon width={19} height={19} /></div>
              <h3 className="mb-2 font-display text-[1.02rem] font-semibold">{title}</h3>
              <p className="text-[.86rem] leading-relaxed text-ink-soft">{body}</p>
            </motion.div>
          ))}
        </RevealStagger>
      </div>
    </section>
  )
}
