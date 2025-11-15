// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function Profile() {
  const [tab, setTab] = useState("posts");
  const [dbUser, setDbUser] = useState(null); // user-ul din baza ta
  const [loadingDbUser, setLoadingDbUser] = useState(true);

  const {
    user,
    isLoading,
    isAuthenticated,
    getAccessTokenSilently,
  } = useAuth0();

  // --- numele complet din ID Token (claim custom) + fallback-uri ---
  const fullNameFromAuth0 =
    user?.["https://creon.app/full_name"] || // din Action, full_name din Lock
    user?.name ||                            // dacă name e setat
    user?.nickname ||                        // fallback nickname
    user?.username ||                        // fallback username
    (user?.email ? user.email.split("@")[0] : ""); // fallback ultim

  // --- stare încărcare Auth0 ---
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

  // --- sincronizare cu baza de date: GET + PUT /api/me ---
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    async function syncUser() {
      try {
        setLoadingDbUser(true);
        const token = await getAccessTokenSilently();

        // 1. GET /api/me – creează user-ul dacă nu există
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error("Eroare la /api/me (GET):", await res.text());
          return;
        }

        let data = await res.json();

        // 2. Trimitem către backend numele complet + email, ca să fie salvate sigur în DB
        const putRes = await fetch(`${import.meta.env.VITE_API_URL}/api/me`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: fullNameFromAuth0 || null,
            email: user.email || null,
          }),
        });

        if (putRes.ok) {
          data = await putRes.json(); // luăm varianta updatată din DB
        }

        setDbUser(data);
      } catch (err) {
        console.error("syncUser error:", err);
      } finally {
        setLoadingDbUser(false);
      }
    }

    syncUser();
  }, [isAuthenticated, user, fullNameFromAuth0, getAccessTokenSilently]);

  // --- date pentru afișare ---
  const profileImage =
    user.picture || "https://placehold.co/200x200/png?text=Avatar";

  const displayName = dbUser?.name || fullNameFromAuth0 || "Nume necompletat";

  const alias =
    dbUser?.username || // dacă vei avea username separat în DB
    (displayName && displayName.split(" ")[0]) ||
    "User";

  const realName = displayName;

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
            <h1 className="text-5xl font-bold text-slate-900">{realName}</h1>
            <p className="text-lg text-slate-700 mt-1">({alias})</p>

            <p className="text-sm text-slate-600 mt-2">
              Email: <span className="font-mono">{user.email}</span>
            </p>

            {loadingDbUser && (
              <p className="text-sm text-slate-500 mt-1">
                Sincronizăm datele cu baza de date...
              </p>
            )}

            {dbUser && (
              <div className="mt-2 text-sm text-slate-700 space-y-1">
                <p>
                  Rol:{" "}
                  <span className="font-semibold">
                    {dbUser.role || "nesetat (BUYER / ARTIST)"}
                  </span>
                </p>
                <p>
                  Țară:{" "}
                  <span className="font-semibold">
                    {dbUser.country || "nesetată"}
                  </span>
                </p>
                {dbUser.role === "ARTIST" && (
                  <p>
                    Domeniu:{" "}
                    <span className="font-semibold">
                      {dbUser.domain || "nesetat"}
                    </span>
                  </p>
                )}
                <p>
                  Limbi:{" "}
                  <span className="font-semibold">
                    {dbUser.languages || "nespecificate"}
                  </span>
                </p>
              </div>
            )}
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
