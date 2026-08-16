import { motion } from 'framer-motion'
import Reveal, { RevealStagger, staggerItem } from './Reveal.jsx'
import { IconCheck } from './Icons.jsx'

const PLANS = [
  { name: 'Starter', price: '₹999', unit: '/mo', desc: 'For teams up to 15 employees.', features: ['Up to 15 employees', 'Directory & attendance', 'Leave requests', 'Email support'], cta: 'Try Live Demo', href: 'app.html', featured: false },
  { name: 'Team', price: '₹2,499', unit: '/mo', desc: 'For teams up to 75 employees.', features: ['Up to 75 employees', 'Everything in Starter', 'Department insights', 'Priority support'], cta: 'Try Live Demo', href: 'app.html', featured: true },
  { name: 'Business', price: 'Custom', unit: '', desc: 'For larger organizations.', features: ['Unlimited employees', 'Everything in Team', 'Custom reporting', 'Dedicated onboarding'], cta: 'Talk to Us', href: '#top', featured: false },
]

export default function Pricing() {
  return (
    <section id="pricing" className="border-t border-border py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto mb-14 max-w-[54ch] text-center">
          <span className="mb-4 inline-block rounded-full bg-indigo-light px-3.5 py-1.5 font-sans text-[.72rem] font-semibold uppercase tracking-[.07em] text-indigo">Pricing</span>
          <h2 className="mb-4 font-display text-[clamp(1.8rem,3.6vw,2.5rem)] font-semibold leading-[1.15] tracking-tight">Simple pricing, built for growing teams.</h2>
          <p className="text-[1.02rem] leading-relaxed text-ink-soft text-pretty">Every plan includes the full directory, attendance, and leave workflow.</p>
        </Reveal>
        <RevealStagger className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {PLANS.map((p) => (
            <motion.div key={p.name} variants={staggerItem} whileHover={{ y: -6 }} className={`relative flex flex-col rounded-2xl border p-7 ${p.featured ? 'border-indigo bg-surface shadow-[0_25px_60px_-25px_rgba(55,48,163,.45)]' : 'border-border bg-surface'}`}>
              {p.featured && <span className="absolute -top-3 left-7 rounded-full bg-indigo px-3 py-1 font-sans text-[.65rem] font-bold uppercase tracking-wide text-white">Most Popular</span>}
              <h3 className="mb-2 font-display text-[1.05rem] font-semibold">{p.name}</h3>
              <div className="font-display text-[2rem] font-bold tracking-tight">{p.price}<small className="text-[.8rem] font-normal text-ink-soft">{p.unit}</small></div>
              <p className="my-3 flex-1 text-[.86rem] leading-relaxed text-ink-soft">{p.desc}</p>
              <ul className="mb-6 flex flex-col gap-2">
                {p.features.map((f) => (<li key={f} className="flex items-start gap-2 text-[.84rem]"><IconCheck width={14} height={14} className="mt-0.5 shrink-0 text-teal" />{f}</li>))}
              </ul>
              <a href={p.href} className={`rounded-lg py-3 text-center text-[.88rem] font-semibold transition-colors ${p.featured ? 'bg-indigo text-white hover:bg-indigo-dark' : 'border border-border text-ink hover:border-indigo hover:bg-indigo-light'}`}>{p.cta}</a>
            </motion.div>
          ))}
        </RevealStagger>
      </div>
    </section>
  )
}
