// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function Profile() {
  const [tab, setTab] = useState("posts");
  const { user, isLoading, isAuthenticated } = useAuth0();

  // stare încărcare
  if (isLoading) {
    return (
      <main className="min-h-screen w-full bg-slate-100 flex items-center justify-center">
        <div className="bg-slate-200 border-4 border-slate-900 rounded-3xl px-8 py-6 shadow-[12px_12px_0_0_#0F172A]">
          <p className="text-xl font-semibold text-slate-900">
            Se încarcă profilul...
          </p>
        </div>
      </main>
    );
  }

  // dacă nu e logat, nu are ce căuta pe profil
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen w-full bg-slate-100 flex items-center justify-center">
        <div className="bg-slate-200 border-4 border-slate-900 rounded-3xl px-8 py-6 shadow-[12px_12px_0_0_#0F172A]">
          <p className="text-xl font-semibold text-slate-900">
            Trebuie să fii autentificat ca să vezi pagina de profil.
          </p>
        </div>
      </main>
    );
  }

  // --- date din Auth0 ---
  const profileImage =
    user.picture || "https://placehold.co/200x200/png?text=Avatar";

  // username / alias - poți schimba logica cum vrei
  const alias =
    user.nickname ||
    (user.name ? user.name.split(" ")[0] : user.email?.split("@")[0]) ||
    "User";

  const realName = user.name || user.email || "Nume necompletat";

  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadUser() {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUserData(data);
    }

    loadUser();
  }, [isAuthenticated]);

  return (
    <main className="min-h-screen w-full bg-slate-100 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-6xl bg-slate-200 border-4 border-slate-900 rounded-3xl shadow-[12px_12px_0_0_#0F172A] p-8">
        {/* HEADER */}
        <header className="flex items-center gap-6 mb-10">
          {/* FOTO PROFIL */}
          <div className="h-40 w-40 rounded-full overflow-hidden bg-white border-4 border-slate-900 shadow-[6px_6px_0_0_#0F172A]">
            <img
              src={profileImage}
              alt="avatar"
              className="h-full w-full object-cover"
            />
          </div>

          {/* TEXT */}
          <div>
            <h1 className="text-5xl font-bold text-slate-900">{alias}</h1>
            <p className="text-lg text-slate-700 mt-1">({realName})</p>
            {/* dacă vrei direct username/email clar */}
            <p className="text-sm text-slate-600 mt-2">
              Username Auth0: <span className="font-mono">{user.nickname || alias}</span>
            </p>
            <p className="text-sm text-slate-600">
              Email: <span className="font-mono">{user.email}</span>
            </p>
          </div>
        </header>

        {/* BODY */}
        <section className="flex gap-8">
          {/* STÂNGA — TAB MENU */}
          <aside className="w-64 bg-slate-100 border-4 border-slate-900 rounded-3xl shadow-[8px_8px_0_0_#0F172A] p-4">
            <nav className="flex flex-col gap-4">
              <button
                className={`neo-btn ${
                  tab === "posts" ? "neo-btn-active" : ""
                }`}
                onClick={() => setTab("posts")}
              >
                Posts
              </button>

              <button
                className={`neo-btn ${
                  tab === "creations" ? "neo-btn-active" : ""
                }`}
                onClick={() => setTab("creations")}
              >
                Creations
              </button>

              <button
                className={`neo-btn ${
                  tab === "contact" ? "neo-btn-active" : ""
                }`}
                onClick={() => setTab("contact")}
              >
                Contact
              </button>
            </nav>
          </aside>

          {/* DREAPTA — CONȚINUT */}
          <div className="flex-1">
            <div className="bg-white border-4 border-slate-900 rounded-3xl p-6 shadow-[10px_10px_0_0_#0F172A] min-h-[300px]">
              {tab === "posts" && (
                <p className="text-slate-700 text-lg">
                  Aici apar postările utilizatorului (o să le legăm mai târziu de
                  baza de date).
                </p>
              )}

              {tab === "creations" && (
                <p className="text-slate-700 text-lg">
                  Aici apar creațiile utilizatorului.
                </p>
              )}

              {tab === "contact" && (
                <p className="text-slate-700 text-lg">
                  Aici va apărea informația de contact (bio, link-uri etc.).
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
