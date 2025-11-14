// src/pages/Profile.jsx
import React, { useState } from "react";

export default function Profile() {
  // TAB-uri: posts, creations, contact
  const [tab, setTab] = useState("posts");

  // simulezi imaginea de profil (pe viitor va veni din DB)
  const profileImage = "https://placehold.co/200x200/png?text=Avatar";

  const alias = "Alias";
  const realName = "nume, prenume";

  return (
    <main className="ui-page-surface">
      <div className="ui-layout-card">

        {/* HEADER */}
      <header className="ui-layout-header">
  
  {/* FOTO PROFIL */}
  <div className="ui-avatar-circle overflow-hidden bg-white">
    <img
      src={profileImage}
      alt="avatar"
      className="h-full w-full object-cover"
    />
  </div>

  {/* Alias + nume real imediat lângă avatar */}
  <div className="ui-header-textblock">
    <h1 className="ui-heading-main">{alias}</h1>
    <p className="ui-heading-sub">({realName})</p>
  </div>

</header>


        {/* BODY */}
        <section className="ui-layout-body">

          {/* STÂNGA — TAB MENU */}
          <aside className="ui-sidebar">
            <nav className="ui-sidebar-nav">

              <button
                className={`ui-sidebar-item ${
                  tab === "posts" ? "ui-sidebar-item-active" : ""
                }`}
                onClick={() => setTab("posts")}
              >
                Posts
              </button>

              <button
                className={`ui-sidebar-item ${
                  tab === "creations" ? "ui-sidebar-item-active" : ""
                }`}
                onClick={() => setTab("creations")}
              >
                Creations
              </button>

              <button
                className={`ui-sidebar-item ${
                  tab === "contact" ? "ui-sidebar-item-active" : ""
                }`}
                onClick={() => setTab("contact")}
              >
                Contact
              </button>

            </nav>
          </aside>

          {/* DREAPTA — CONȚINUT DINAMIC */}
          <div className="ui-main-area">
            <div className="ui-main-panel">

              {tab === "posts" && (
                <p className="text-sm text-slate-600">
                  Aici apar postările utilizatorului.
                </p>
              )}

              {tab === "creations" && (
                <p className="text-sm text-slate-600">
                  Aici apar creațiile utilizatorului.
                </p>
              )}

              {tab === "contact" && (
                <p className="text-sm text-slate-600">
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
