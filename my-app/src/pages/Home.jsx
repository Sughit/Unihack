import React, { usseState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Home() {

   useEffect(() => {
      document.body.style.overflow = "hidden";
  
      return () => {
        document.body.style.overflow = "auto";
      };
    }, []);
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
                Intro
              </span>
            </div>

            {/* Liniile de sus, ca la signup-top-lines */}
            <div className="mb-6 mt-2">
              <div className="h-1.5 w-32 rounded-full bg-slate-900" />
              <div className="mt-1 h-1 w-40 rounded-full bg-amber-300" />
            </div>

            {/* Text principal */}
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-3 pr-5">
              Welcome to {" "}
              <span className="underline decoration-amber-300 decoration-[6px]">
                Creon
              </span>{", "}
              where creators and companies truly meet.
            </h1>

            <p className="text-sm md:text-base text-slate-700 max-w-xl mb-6">
              A modern platform built to connect buissinesses with artists.
            </p>

            {/* CTA buttons – folosim nav-btn */}
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/signup" className="nav-btn nav-btn-primary">
                Get started
              </Link>
              <Link to="/search" className="nav-btn nav-btn-outline">
                Search
              </Link>
            </div>

            {/* Linie verticală decorativă, ca la signup-vertical-line */}
            <span className="pointer-events-none absolute top-24 right-16 bottom-16 border-l-4 border-dashed border-amber-300" />
          </div>

          {/* CARD SECUNDAR – info / stats / quick links */}
          <aside className="relative rounded-[2.5rem] border-[4px] border-slate-900 bg-white px-8 pt-8 pb-7 shadow-[8px_8px_0_0_rgba(15,23,42,1)] flex flex-col justify-between">
            <div>
              <p className="text-sm text-slate-700 mb-4">
                Creon is a marketplace that helps businesses find real artists — not AI generators — for branding, illustrations, video, UI design and more.
              </p>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="rounded-2xl border-[3px] border-slate-900 bg-amber-200 px-3 py-2 shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                  <p className="text-lg font-black text-slate-900">Browse real talent</p>
                </div>
                <div className="rounded-2xl border-[3px] border-slate-900 bg-sky-200 px-3 py-2 shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                  <p className="text-lg font-black text-slate-900">Chat and request quotes</p>
                </div>
                <div className="rounded-2xl border-[3px] border-slate-900 bg-lime-200 px-3 py-2 shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                  <p className="text-lg font-black text-slate-900">Hire professionals safely</p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
