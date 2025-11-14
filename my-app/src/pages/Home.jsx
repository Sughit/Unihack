export default function Home() {
  return (
    <main className="bg-slate-100 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 pt-8 pb-12">

        {/* HERO SECTION */}
        <section className="grid gap-8 md:grid-cols-[1.4fr,1fr] items-stretch">

          {/* CARD PRINCIPAL – stil apropiat de signup-card */}
          <div className="relative rounded-[2.75rem] border-[4px] border-slate-900 bg-white px-10 pt-10 pb-10 shadow-[8px_8px_0_0_rgba(15,23,42,1)] overflow-hidden">
            {/* „Header pill” în interior, ca la signup-header */}
            <div className="relative mx-auto mb-6 flex w-max items-center justify-center px-10 py-2 rounded-full border-[4px] border-slate-900 bg-white shadow-[6px_6px_0_0_rgba(15,23,42,1)]">
              <span className="absolute inset-x-3 bottom-1 h-2 rounded-full bg-amber-300 -z-10" />
              <span className="text-xs md:text-sm font-black tracking-[0.35em] uppercase text-slate-900">
                Dashboard
              </span>
            </div>

            {/* Liniile de sus, ca la signup-top-lines */}
            <div className="mb-6 mt-2">
              <div className="h-1.5 w-32 rounded-full bg-slate-900" />
              <div className="mt-1 h-1 w-40 rounded-full bg-amber-300" />
            </div>

            {/* Text principal */}
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-3">
              Welcome to your{" "}
              <span className="underline decoration-amber-300 decoration-[6px]">
                neobrutalist
              </span>{" "}
              workspace.
            </h1>

            <p className="text-sm md:text-base text-slate-700 max-w-xl mb-6">
              Folosește acest Home ca punct de pornire pentru proiectul tău.
              Layout simplu, blocuri clare, totul gândit să se potrivească cu
              pagina de <strong>signup</strong> și cu <strong>navbarul</strong>.
            </p>

            {/* CTA buttons – folosim nav-btn */}
            <div className="flex flex-wrap items-center gap-3">
              <button className="nav-btn nav-btn-primary">
                Get started
              </button>
              <button className="nav-btn nav-btn-outline">
                View docs
              </button>
              <span className="text-[11px] text-slate-600 uppercase tracking-wide">
                React · Vite · Tailwind 4.1
              </span>
            </div>

            {/* Linie verticală decorativă, ca la signup-vertical-line */}
            <span className="pointer-events-none absolute top-24 right-16 bottom-16 border-l-4 border-dashed border-amber-300" />
          </div>

          {/* CARD SECUNDAR – info / stats / quick links */}
          <aside className="relative rounded-[2.5rem] border-[4px] border-slate-900 bg-white px-8 pt-8 pb-7 shadow-[8px_8px_0_0_rgba(15,23,42,1)] flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-black tracking-[0.25em] uppercase text-slate-900 mb-3">
                Overview
              </h2>

              <p className="text-sm text-slate-700 mb-4">
                Aici poți afișa un rezumat: număr de utilizatori, teste, rute
                sau orice metrici vrei în aplicația ta.
              </p>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="rounded-2xl border-[3px] border-slate-900 bg-amber-200 px-3 py-2 shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                  <p className="text-[10px] uppercase tracking-wide text-slate-800">
                    Users
                  </p>
                  <p className="text-lg font-black text-slate-900">1.2k</p>
                </div>
                <div className="rounded-2xl border-[3px] border-slate-900 bg-sky-200 px-3 py-2 shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                  <p className="text-[10px] uppercase tracking-wide text-slate-800">
                    Sessions
                  </p>
                  <p className="text-lg font-black text-slate-900">8.4k</p>
                </div>
                <div className="rounded-2xl border-[3px] border-slate-900 bg-lime-200 px-3 py-2 shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                  <p className="text-[10px] uppercase tracking-wide text-slate-800">
                    Conversion
                  </p>
                  <p className="text-lg font-black text-slate-900">12%</p>
                </div>
              </div>
            </div>

            <div className="mt-5 border-t-4 border-dashed border-amber-300 pt-4">
              <p className="text-[11px] text-slate-700 mb-2">
                Poți înlocui cardul ăsta cu:
              </p>
              <ul className="text-[11px] text-slate-800 list-disc list-inside space-y-1">
                <li>Lista ultimelor activități</li>
                <li>Link rapid către pagina de teste</li>
                <li>Shortcut către dashboard / admin</li>
              </ul>
            </div>
          </aside>
        </section>

        {/* SECȚIUNE DE JOS – 3 carduri info, tot în același stil */}
        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-[2rem] border-[4px] border-slate-900 bg-white px-6 py-5 shadow-[6px_6px_0_0_rgba(15,23,42,1)]">
            <h3 className="text-sm font-black tracking-[0.2em] uppercase text-slate-900 mb-2">
              Consistent
            </h3>
            <p className="text-xs text-slate-700">
              Folosește aceleași culori, border-uri și umbre ca la navbar și
              signup ca să păstrezi tot designul unitar.
            </p>
          </div>

          <div className="rounded-[2rem] border-[4px] border-slate-900 bg-white px-6 py-5 shadow-[6px_6px_0_0_rgba(15,23,42,1)]">
            <h3 className="text-sm font-black tracking-[0.2em] uppercase text-slate-900 mb-2">
              Simple layout
            </h3>
            <p className="text-xs text-slate-700">
              Grid cu 2 coloane sus + 3 carduri jos este ușor de extins în
              dashboard sau pagini noi.
            </p>
          </div>

          <div className="rounded-[2rem] border-[4px] border-slate-900 bg-white px-6 py-5 shadow-[6px_6px_0_0_rgba(15,23,42,1)]">
            <h3 className="text-sm font-black tracking-[0.2em] uppercase text-slate-900 mb-2">
              Plug & Play
            </h3>
            <p className="text-xs text-slate-700">
              Înlocuiești textul cu datele tale și ai deja un Home page prezentabil
              pentru demo / hackathon.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
