// src/pages/Profile.jsx
import React, { useState } from "react";

export default function Profile() {
  const [tab, setTab] = useState("posts");

  const profileImage = "https://placehold.co/200x200/png?text=Avatar";
  const alias = "Alias";
  const realName = "nume, prenume";

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
          </div>

        </header>

        {/* BODY */}
        <section className="flex gap-8">

          {/* STANGA — TAB MENU */}
          <aside className="w-64 bg-slate-100 border-4 border-slate-900 rounded-3xl shadow-[8px_8px_0_0_#0F172A] p-4">
            <nav className="flex flex-col gap-4">

              <button
                className={`neo-btn ${tab === "posts" ? "neo-btn-active" : ""}`}
                onClick={() => setTab("posts")}
              >
                Posts
              </button>

              <button
                className={`neo-btn ${tab === "creations" ? "neo-btn-active" : ""}`}
                onClick={() => setTab("creations")}
              >
                Creations
              </button>

              <button
                className={`neo-btn ${tab === "contact" ? "neo-btn-active" : ""}`}
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
                  Aici apar postările utilizatorului.
                </p>
              )}

              {tab === "creations" && (
                <p className="text-slate-700 text-lg">
                  Aici apar creațiile utilizatorului.
                </p>
              )}

              {tab === "contact" && (
                <p className="text-slate-700 text-lg">
                  Aici apare informația de contact a utilizatorului.
                </p>
              )}

            </div>
          </div>

        </section>
      </div>
    </main>
  );
}
