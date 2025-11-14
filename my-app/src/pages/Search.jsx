// src/pages/Search.jsx
import React, { useState, useMemo } from "react";

const ALL_DOMAINS = ["Any", "Illustration", "Music", "Video", "Branding"];
const COUNTRIES = ["Any", "Romania", "Germany", "UK"];
const COUNTIES_RO = [
  "Any",
  "Iași",
  "Timiș",
  "Cluj",
  "București",
  "Brașov",
  "Constanța",
];
const LANGUAGES = ["Any", "English", "Romanian", "German", "French"];

const ARTISTS = [
  {
    id: 1,
    alias: "ArtistOne",
    domain: "Illustration",
    experience: 3,
    country: "Romania",
    county: "Iași",
    language: "Romanian",
    desc: "Digital illustrator & concept artist.",
  },
  {
    id: 2,
    alias: "SoundWave",
    domain: "Music",
    experience: 5,
    country: "Romania",
    county: "Timiș",
    language: "English",
    desc: "Music producer – ambient & lo-fi.",
  },
  {
    id: 3,
    alias: "FrameCraft",
    domain: "Video",
    experience: 2,
    country: "Germany",
    county: "Any",
    language: "English",
    desc: "Video editor & motion graphics.",
  },
  {
    id: 4,
    alias: "PixelDust",
    domain: "Branding",
    experience: 7,
    country: "UK",
    county: "Any",
    language: "English",
    desc: "Logo & visual identity designer.",
  },
];

export default function Search() {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("Any");
  const [expMin, setExpMin] = useState("");
  const [expMax, setExpMax] = useState("");
  const [country, setCountry] = useState("Any");
  const [county, setCounty] = useState("Any");
  const [language, setLanguage] = useState("Any");

  const filteredArtists = useMemo(() => {
    return ARTISTS.filter((a) => {
      if (search && !a.alias.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (domain !== "Any" && a.domain !== domain) return false;
      if (country !== "Any" && a.country !== country) return false;
      if (country === "Romania" && county !== "Any" && a.county !== county)
        return false;
      if (language !== "Any" && a.language !== language) return false;

      if (expMin && a.experience < Number(expMin)) return false;
      if (expMax && a.experience > Number(expMax)) return false;

      return true;
    });
  }, [search, domain, expMin, expMax, country, county, language]);

  const availableCounties =
    country === "Romania" ? COUNTIES_RO : ["Any"];

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* SEARCH BAR */}
        <div className="mb-8">
          <div className="bg-white border-4 border-slate-900 rounded-full shadow-[8px_8px_0_0_#0F172A] px-6 py-3 flex gap-3 items-center">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-base"
            />
            <button
              type="button"
              className="px-4 py-2 border-2 border-slate-900 rounded-full text-sm font-semibold shadow-[4px_4px_0_0_#0F172A]"
            >
              GO
            </button>
          </div>
        </div>

        {/* LAYOUT: FILTRE + LISTĂ */}
        <div className="grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)] gap-8">

          {/* FILTRE STÂNGA */}
          <aside className="bg-white border-4 border-slate-900 rounded-3xl shadow-[8px_8px_0_0_#0F172A] p-6">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>

            {/* Domain */}
            <div className="mb-5">
              <label className="block text-sm font-medium mb-1">
                Domain
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full border-2 border-slate-900 rounded-xl px-3 py-2 bg-white text-sm"
              >
                {ALL_DOMAINS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience */}
            <div className="mb-5">
              <label className="block text-sm font-medium mb-1">
                Experience (years)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  value={expMin}
                  onChange={(e) => setExpMin(e.target.value)}
                  placeholder="Min"
                  className="w-1/2 border-2 border-slate-900 rounded-xl px-3 py-2 bg-white text-sm"
                />
                <input
                  type="number"
                  min="0"
                  value={expMax}
                  onChange={(e) => setExpMax(e.target.value)}
                  placeholder="Max"
                  className="w-1/2 border-2 border-slate-900 rounded-xl px-3 py-2 bg-white text-sm"
                />
              </div>
            </div>

            {/* Location */}
            <div className="mb-5">
              <label className="block text-sm font-medium mb-1">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setCounty("Any");
                }}
                className="w-full border-2 border-slate-900 rounded-xl px-3 py-2 bg-white text-sm mb-2"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <label className="block text-sm font-medium mb-1">
                County
              </label>
              <select
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                disabled={country !== "Romania"}
                className="w-full border-2 border-slate-900 rounded-xl px-3 py-2 bg-white text-sm disabled:bg-slate-100"
              >
                {availableCounties.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full border-2 border-slate-900 rounded-xl px-3 py-2 bg-white text-sm"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </aside>

          {/* LISTĂ ARTIȘTI — SCROLL VERTICAL NATURAL */}
          <section className="space-y-4">
            {filteredArtists.length === 0 && (
              <p className="text-sm text-slate-600">
                No artists match the current filters.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArtists.map((a) => (
                <article
                  key={a.id}
                  className="bg-white border-4 border-slate-900 rounded-3xl shadow-[8px_8px_0_0_#0F172A] p-6 flex flex-col items-center"
                >
                  <div className="h-20 w-20 rounded-full border-4 border-slate-900 flex items-center justify-center mb-4 text-xs font-medium">
                    avatar
                  </div>

                  <h3 className="text-lg font-semibold mb-1">{a.alias}</h3>
                  <p className="text-xs uppercase tracking-wide mb-2">
                    {a.domain} · {a.experience} yrs
                  </p>

                  <p className="text-sm text-center mb-4">{a.desc}</p>

                  <button className="mt-auto w-full border-2 border-slate-900 rounded-xl py-2 text-sm font-semibold shadow-[4px_4px_0_0_#0F172A]">
                    CONTACT
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
    