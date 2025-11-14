// src/pages/Home.jsx
export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        {/* NAVBAR */}
        <header className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="nb-logo-box">U</div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-50">
                Unihack Project
              </h1>
              <p className="text-xs text-slate-300">
                Built with React · Vite · Tailwind
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-3">
            <button className="nb-pill">Home</button>
            <button className="nb-pill-ghost">Features</button>
            <button className="nb-pill-ghost">Docs</button>
          </nav>

          <button className="nb-btn-small">
            Login
          </button>
        </header>

        <main className="space-y-10 md:space-y-12">
          {/* HERO */}
          <section className="grid gap-6 md:grid-cols-[1.4fr,1fr] items-stretch">
            <div className="nb-card relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 border-4 border-black rounded-[32px] bg-pink-300 rotate-6 opacity-80" />
              <div className="absolute -left-8 -bottom-8 w-28 h-28 border-4 border-black rounded-3xl bg-sky-300 -rotate-6 opacity-90" />

              <div className="relative space-y-4">
                <div className="inline-flex items-center gap-2 nb-badge">
                  <span className="w-2.5 h-2.5 rounded-full bg-lime-500 border border-black" />
                  <span>Neobrutalism UI kit ready</span>
                </div>

                <h2 className="text-3xl md:text-4xl font-black leading-tight">
                  A bold, neobrutalist home page
                  <span className="block text-slate-700">
                    that you can reuse everywhere.
                  </span>
                </h2>

                <p className="text-sm md:text-base max-w-lg text-slate-700">
                  Use these utility classes to keep the same “blocky, colorful, with thick borders”
                  style on any page. Perfect for hackathons, dashboards or dev tools.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button className="nb-btn">
                    Get Started
                  </button>
                  <button className="nb-btn-ghost">
                    View Components
                  </button>
                  <span className="text-xs text-slate-700">
                    No design system? This is your starter kit.
                  </span>
                </div>
              </div>
            </div>

            {/* SIDE CARD */}
            <div className="nb-card bg-lime-300 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="nb-section-title">
                  Project snapshot
                </h3>
                <p className="text-sm text-slate-800">
                  Perfect for showing a quick overview: users, modules, or any metrics you need.
                </p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                <div className="nb-stat">
                  <span className="nb-stat-label">Users</span>
                  <span className="nb-stat-value">1.2k</span>
                </div>
                <div className="nb-stat bg-sky-300">
                  <span className="nb-stat-label">Sessions</span>
                  <span className="nb-stat-value">8.4k</span>
                </div>
                <div className="nb-stat bg-pink-300">
                  <span className="nb-stat-label">Conversion</span>
                  <span className="nb-stat-value">12%</span>
                </div>
              </div>
            </div>
          </section>

          {/* FEATURES */}
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="nb-section-title">
                Features
              </h3>
              <span className="nb-tag">
                Neobrutalism presets
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <article className="nb-card bg-sky-300">
                <h4 className="nb-card-title">Reusable components</h4>
                <p className="nb-card-text">
                  Use <code className="nb-code">.nb-card</code>,{" "}
                  <code className="nb-code">.nb-btn</code> and{" "}
                  <code className="nb-code">.nb-pill</code> classes on any element
                  to keep a consistent look.
                </p>
              </article>

              <article className="nb-card bg-yellow-300">
                <h4 className="nb-card-title">Fast to customize</h4>
                <p className="nb-card-text">
                  Change just a few Tailwind utilities in the component layer
                  and the whole site updates automatically.
                </p>
              </article>

              <article className="nb-card bg-pink-300">
                <h4 className="nb-card-title">Hackathon-ready</h4>
                <p className="nb-card-text">
                  Big fonts, strong borders, strong colors. Looks good even with
                  minimal content and no complex design.
                </p>
              </article>
            </div>
          </section>

          {/* BOTTOM GRID */}
          <section className="grid gap-4 md:grid-cols-[1.2fr,1fr] items-stretch">
            <div className="nb-card bg-slate-50">
              <h3 className="nb-section-title mb-2">
                How to reuse this style
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-800">
                <li>Keep all neobrutalist utilities in <code className="nb-code">index.css</code> under <code className="nb-code">@layer components</code>.</li>
                <li>Use semantic HTML + Tailwind utilities + these classes on new pages.</li>
                <li>Don&apos;t over-optimize layouts, the style looks good even “blocky”.</li>
              </ol>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="nb-chip">.nb-card</span>
                <span className="nb-chip">.nb-btn</span>
                <span className="nb-chip">.nb-btn-ghost</span>
                <span className="nb-chip">.nb-pill</span>
                <span className="nb-chip">.nb-tag</span>
              </div>
            </div>

            <div className="nb-card bg-slate-100 flex flex-col justify-between">
              <div>
                <h3 className="nb-section-title mb-2">
                  Quick CTA
                </h3>
                <p className="nb-card-text">
                  Use this block for newsletter, sign up, or a short description of your app.
                </p>
              </div>

              <form className="mt-4 space-y-2">
                <div className="nb-input-wrapper">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="nb-input"
                  />
                </div>
                <button type="submit" className="nb-btn w-full justify-center">
                  Join the beta
                </button>
              </form>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="mt-10 flex flex-wrap items-center justify-between gap-2 border-4 border-black rounded-2xl bg-slate-50 px-4 py-3 shadow-[5px_5px_0_0_rgba(15,23,42,1)]">
          <span className="text-xs font-medium text-slate-800">
            © {new Date().getFullYear()} Unihack project. Built in React + Vite + Tailwind.
          </span>
          <span className="text-[11px] uppercase tracking-wide bg-yellow-300 border-2 border-black rounded-xl px-3 py-1">
            Neobrutalism mode: ON
          </span>
        </footer>
      </div>
    </div>
  );
}
