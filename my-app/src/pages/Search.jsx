// src/pages/Search.jsx
import React from "react";

const artists = [
  {
    id: 1,
    alias: "ArtistOne",
    desc: "Digital illustrator & concept art.",
  },
  {
    id: 2,
    alias: "SoundWave",
    desc: "Music producer – ambient & lo-fi.",
  },
  {
    id: 3,
    alias: "FrameCraft",
    desc: "Video editor & motion graphics.",
  },
  {
    id: 4,
    alias: "PixelDust",
    desc: "Branding & logo designer.",
  },
];

export default function Search() {
  return (
    <main className="min-h-screen w-full bg-slate-100 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-6xl bg-slate-200 border-4 border-slate-900 rounded-3xl shadow-[12px_12px_0_0_#0F172A] p-8">

        {/* SEARCH BAR */}
        <div className="flex justify-center mb-10">
          <div className="w-full max-w-3xl bg-rose-200 border-4 border-slate-900 rounded-full shadow-[8px_8px_0_0_#0F172A] px-8 py-3 flex items-center">
            <input
              type="text"
              placeholder="SEARCH"
              className="w-full bg-transparent outline-none text-center text-lg tracking-wide uppercase placeholder:text-slate-800"
            />
          </div>
        </div>

        {/* BODY */}
        <section className="flex gap-8 items-start">

          {/* FILTRE STÂNGA */}
          <aside className="w-64 bg-rose-200 border-4 border-slate-900 rounded-[40px] shadow-[8px_8px_0_0_#0F172A] px-8 py-10">
            <ul className="space-y-6 text-lg text-slate-900">
              <li className="font-semibold">filters</li>
              <li>domain</li>
              <li>experience</li>
              <li>location</li>
              <li>language</li>
            </ul>
          </aside>

          {/* CARDURI ARTIȘTI */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-8 min-w-max">
              {artists.map((a) => (
                <div
                  key={a.id}
                  className="w-64 bg-rose-200 border-4 border-slate-900 rounded-[40px] shadow-[8px_8px_0_0_#0F172A] px-6 py-8 flex flex-col items-center"
                >
                  {/* avatar cerc */}
                  <div className="mb-6 h-24 w-24 rounded-full bg-yellow-200 border-4 border-slate-900 flex items-center justify-center text-slate-900 font-semibold">
                    avatar
                  </div>

                  {/* alias */}
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">
                    {a.alias}
                  </h2>

                  {/* short description */}
                  <button className="w-full bg-rose-400 border-4 border-slate-900 py-2 text-sm font-medium text-slate-900 mb-4 shadow-[4px_4px_0_0_#0F172A]">
                    {a.desc || "short description"}
                  </button>

                  {/* contact */}
                  <button className="w-full bg-rose-400 border-4 border-slate-900 py-2 text-sm font-semibold text-slate-900 shadow-[4px_4px_0_0_#0F172A]">
                    CONTACT
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
