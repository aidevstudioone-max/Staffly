export default function Footer() {
  return (
    <footer className="border-t border-border py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center">
        <a href="#top" className="font-display text-[1rem] font-bold text-ink">Staffly</a>
        <p className="max-w-[48ch] text-[.86rem] leading-relaxed text-ink-soft">Employee management, built for small and growing teams.</p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[.8rem] text-ink-soft">
          <a href="#features" className="hover:text-indigo">Features</a>
          <a href="#preview" className="hover:text-indigo">Live Preview</a>
          <a href="#pricing" className="hover:text-indigo">Pricing</a>
        </div>
        <p className="mt-4 text-[.76rem] text-ink-soft/80">© 2026 Staffly. Demo product — all data is stored locally in your browser, no real employee records are processed.</p>
      </div>
    </footer>
  )
}
