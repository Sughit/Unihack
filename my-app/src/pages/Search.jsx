// src/pages/Search.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

// Domenii și țări (le păstrăm hardcodate deocamdată)
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

// Limbi – folosim coduri, pentru că în Prisma salvezi gen "ro,en"
const LANGUAGE_OPTIONS = [
  { value: "", label: "Any" },
  { value: "en", label: "English" },
  { value: "ro", label: "Romanian" },
  { value: "de", label: "German" },
  { value: "fr", label: "French" },
];

// Poți pune în .env: VITE_API_URL=http://localhost:4000
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Search() {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("Any");
  const [expMin, setExpMin] = useState("");
  const [expMax, setExpMax] = useState("");
  const [country, setCountry] = useState("Any");
  const [county, setCounty] = useState("Any");
  const [language, setLanguage] = useState(""); // cod: "", "en", "ro" etc.

  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔐 Auth0 pentru follow
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [followingIds, setFollowingIds] = useState(new Set());

  // ====== FETCH ARTISTS DIN BACKEND ======
  useEffect(() => {
    let cancelled = false;

    async function loadArtists() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE}/api/artists`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();

        if (!cancelled) {
          // ⚠️ AICI filtrăm doar userii cu rol ARTIST
          const onlyArtists = (data || []).filter(
            (u) => u.role === "ARTIST"
          );
          setArtists(onlyArtists);
        }
      } catch (err) {
        console.error("Could not load artists:", err);
        if (!cancelled) {
          setError("Could not load artists. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadArtists();

    return () => {
      cancelled = true;
    };
  }, []);

  // ====== LOAD FOLLOWING (ca în Main.jsx) ======
  useEffect(() => {
    if (!isAuthenticated) {
      setFollowingIds(new Set());
      return;
    }

    let cancelled = false;

    async function loadFollowing() {
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(`${API_BASE}/api/following`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;

        const data = await res.json(); // listă de useri
        if (!cancelled) {
          const ids = new Set(data.map((u) => u.id));
          setFollowingIds(ids);
        }
      } catch (err) {
        console.error("loadFollowing (Search) error:", err);
      }
    }

    loadFollowing();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, getAccessTokenSilently]);

  // ====== TOGGLE FOLLOW DIN SEARCH ======
  async function handleToggleFollow(userId) {
    if (!isAuthenticated) {
      alert("You need to be logged in to follow artists.");
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${API_BASE}/api/users/${userId}/follow`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Error toggling follow (Search):", await res.text());
        return;
      }

      const data = await res.json(); // { following: true/false }

      setFollowingIds((prev) => {
        const next = new Set(prev);
        if (data.following) {
          next.add(userId);
        } else {
          next.delete(userId);
        }
        return next;
      });
    } catch (err) {
      console.error("handleToggleFollow error:", err);
    }
  }

  const availableCounties = country === "Romania" ? COUNTIES_RO : ["Any"];

  // ====== FILTRARE ARTIȘTI PE BAZĂ DE CONTROALE ======
  const filteredArtists = useMemo(() => {
    return artists.filter((a) => {
      const alias = a.username || a.name || a.email || "Unknown artist";

      // Search în nume/alias
      if (
        search &&
        !alias.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }

      // Domain
      if (domain !== "Any" && a.domain !== domain) return false;

      // Country + county
      if (country !== "Any" && a.country !== country) return false;
      if (
        country === "Romania" &&
        county !== "Any" &&
        a.county &&
        a.county !== county
      ) {
        return false;
      }

      // Language: în Prisma ai gen "ro,en"
      if (language) {
        const langs =
          (a.languages || "")
            .toLowerCase()
            .split(",")
            .map((x) => x.trim()) || [];
        if (!langs.includes(language)) return false;
      }

      // Experience: momentan nu e în modelul User.
      const expValue =
        typeof a.experience === "number" ? a.experience : 0;

      if (expMin && expValue < Number(expMin)) return false;
      if (expMax && expValue > Number(expMax)) return false;

      return true;
    });
  }, [artists, search, domain, expMin, expMax, country, county, language]);

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
                {LANGUAGE_OPTIONS.map((l) => (
                  <option key={l.label} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </aside>

          {/* LISTĂ ARTIȘTI */}
          <section className="space-y-4">
            {loading && (
              <p className="text-sm text-slate-600">Loading artists…</p>
            )}
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            {!loading && !error && filteredArtists.length === 0 && (
              <p className="text-sm text-slate-600">
                No artists match the current filters.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArtists.map((a) => {
                const alias =
                  a.username || a.name || a.email || "Unknown artist";
                const domainLabel = a.domain || "Unknown domain";

                const expValue =
                  typeof a.experience === "number" ? a.experience : null;

                const avatarUrl =
                  a.avatarUrl ||
                  "https://placehold.co/160x160/png?text=Avatar";

                const isFollowing = followingIds.has(a.id);

                return (
                  <article
                    key={a.id}
                    className="bg-white border-4 border-slate-900 rounded-3xl shadow-[8px_8px_0_0_#0F172A] p-6 flex flex-col items-center"
                  >
                    <div className="h-20 w-20 rounded-full border-4 border-slate-900 overflow-hidden flex items-center justify-center mb-4 bg-slate-100">
                      <img
                        src={avatarUrl}
                        alt={`${alias} avatar`}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <h3 className="text-lg font-semibold mb-1">{alias}</h3>
                    <p className="text-xs uppercase tracking-wide mb-2">
                      {domainLabel}
                      {expValue !== null && ` · ${expValue} yrs`}
                    </p>

                    <p className="text-sm text-center mb-4 line-clamp-3">
                      {a.bio || "No description provided yet."}
                    </p>

                    <div className="mt-auto flex w-full gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleFollow(a.id)}
                        className="flex-1 text-xs nav-btnborder-2 border-slate-900 rounded-xl py-2 font-semibold shadow-[4px_4px_0_0_#0F172A] bg-white"
                      >
                        {isFollowing ? "Unfollow" : "Follow"}
                      </button>

                      <button
                        type="button"
                        className="flex-1 text-xs border-2 border-slate-900 rounded-xl py-2 font-semibold shadow-[4px_4px_0_0_#0F172A] bg-amber-200"
                      >
                        View profile
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
