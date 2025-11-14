// src/pages/Profile.jsx
import React from "react";

export default function Profile() {
  // aici vei pune datele reale mai târziu
  const alias = "Alias";
  const realName = "nume, prenume";

  return (
    <main className="ui-page-surface">
      <div className="ui-layout-card">
        {/* HEADER */}
        <header className="ui-layout-header">
          <div className="ui-avatar-circle">
            {/* placeholder simplu pentru avatar */}
            <span className="ui-avatar-placeholder" />
          </div>

          <div className="flex-1 text-center">
            <h1 className="ui-heading-main">{alias}</h1>
            <p className="ui-heading-sub">({realName})</p>
          </div>
        </header>

        {/* BODY: sidebar + content */}
        <section className="ui-layout-body">
          {/* stânga – meniul vertical */}
          <aside className="ui-sidebar">
            <nav className="ui-sidebar-nav">
              <button className="ui-sidebar-item ui-sidebar-item-active">
                posts
              </button>
              <button className="ui-sidebar-item">creations</button>
              <button className="ui-sidebar-item">contact</button>
            </nav>
          </aside>

          {/* dreapta – zona mare de conținut */}
          <div className="ui-main-area">
            <div className="ui-main-panel">
              {/* aici vei randa conținutul pentru tab-ul selectat */}
              <p className="text-sm text-slate-500">
                Content area – aici apar postările, creațiile sau contactul.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
