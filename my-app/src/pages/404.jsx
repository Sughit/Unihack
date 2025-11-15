// src/pages/404.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Page404() {
  const location = useLocation();

  return (
    <main className="bg-slate-100 min-h-screen flex items-center justify-center px-4">
      <div className="max-w-3xl w-full">
        {/* CARD PRINCIPAL 404 */}
        <div className="relative rounded-[2.75rem] border-[4px] border-slate-900 bg-white px-8 md:px-12 pt-10 pb-10 shadow-[8px_8px_0_0_rgba(15,23,42,1)] overflow-hidden">
          {/* Pill sus */}
          <div className="relative mx-auto mb-6 flex w-max items-center justify-center px-10 py-2 rounded-full border-[4px] border-slate-900 bg-white shadow-[6px_6px_0_0_rgba(15,23,42,1)]">
            <span className="absolute inset-x-3 bottom-1 h-2 rounded-full bg-amber-300 -z-10" />
            <span className="text-xs md:text-sm font-black tracking-[0.35em] uppercase text-slate-900">
              Oops
            </span>
          </div>

          {/* Linii decorative sus */}
          <div className="mb-6 mt-2">
            <div className="h-1.5 w-32 rounded-full bg-slate-900" />
            <div className="mt-1 h-1 w-40 rounded-full bg-amber-300" />
          </div>

          {/* Conținut text */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
            <div className="md:w-1/3">
              <p className="text-6xl md:text-7xl font-black text-slate-900 leading-none drop-shadow-[4px_4px_0_rgba(15,23,42,1)]">
                404
              </p>
              <p className="mt-3 text-xs uppercase font-semibold tracking-wide text-slate-500">
                Page not found
              </p>
            </div>

            <div className="md:flex-1">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 mb-2">
                This page got lost in the creative chaos.
              </h1>
              <p className="text-sm md:text-base text-slate-700 mb-3">
                We couldn&apos;t find{" "}
                <span className="font-mono nb-code align-middle">
                  {location.pathname}
                </span>{" "}
                in Creon. It might have been moved, deleted, or never existed.
              </p>
              <p className="text-xs md:text-sm text-slate-500 mb-6">
                Don&apos;t worry — you can go back to the main stage or start
                exploring artists again.
              </p>

              {/* Butoane acțiune */}
              <div className="flex flex-wrap gap-3">
                <Link to="/" className="nb-btn">
                  Back to Home
                </Link>
             
              </div>
            </div>
          </div>

          {/* Linie verticală decorativă în dreapta */}
          <span className="pointer-events-none absolute top-20 right-10 bottom-10 border-l-4 border-dashed border-amber-300" />

          {/* Badge mic jos-stânga */}
          <div className="absolute left-8 bottom-6 rounded-2xl border-[3px] border-slate-900 bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
            <span className="mr-1">Tip</span>
            <span className="font-normal normal-case">
              Use the navbar to navigate to a valid page.
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
