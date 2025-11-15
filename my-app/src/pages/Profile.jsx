// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import countries from "../assets/countries.json";
import domains from "../assets/domains.json";
import languagesList from "../assets/languages.json";


export default function Profile() {
  const [tab, setTab] = useState("posts");
  const [dbUser, setDbUser] = useState(null); // user-ul din baza ta
  const [loadingDbUser, setLoadingDbUser] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // "success" | "error" | null

  const [form, setForm] = useState({
    username: "",
    role: "",
    country: "",
    domain: "",
    languages: "",
    email: "",
  });

  const {
    user,
    isLoading,
    isAuthenticated,
    getAccessTokenSilently,
  } = useAuth0();

  // --- numele complet din ID Token (claim custom) + fallback-uri ---
  const fullNameFromAuth0 =
    user?.["https://creon.app/full_name"] || // din Action, full_name din Lock
    user?.name || // dacă name e setat
    user?.nickname || // fallback nickname
    user?.username || // fallback username
    (user?.email ? user.email.split("@")[0] : ""); // fallback ultim

  // --- sincronizare cu baza de date: GET + PUT /api/me (name + email) ---
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

        // 2. Trimitem către backend numele complet + email,
        // fără să stricăm un email existent din DB dacă Auth0 nu trimite niciunul
        const currentEmail = user?.email || data.email || null;
        const currentName = fullNameFromAuth0 || data.name || null;

        const putRes = await fetch(`${import.meta.env.VITE_API_URL}/api/me`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: currentName,
            email: currentEmail,
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

  // --- când avem dbUser, populăm formularul de editare ---
  useEffect(() => {
    if (!dbUser) return;

    const userEmail = user?.email || "";

    setForm({
      username: dbUser.username || "",
      role: dbUser.role || "",
      country: dbUser.country || "",
      domain: dbUser.domain || "",
      languages: dbUser.languages || "",
      // dacă Auth0 nu dă email, folosim ce e în DB; altfel, email din Auth0
      email: userEmail || dbUser.email || "",
    });
  }, [dbUser, user]);

  // --- handlers pentru formular ---
  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSaveStatus(null); // resetăm mesajul când modifici ceva
  }

  async function onSave(e) {
    e.preventDefault();
    if (!dbUser) return;

    try {
      console.log("Submitting profile form...", form);
      setSaving(true);
      setSaveStatus(null);

      const token = await getAccessTokenSilently();

      const payload = {
        username: form.username || null,
        role: form.role || null,
        country: form.country || null,
        languages: form.languages || null,
      };

      if (form.role === "ARTIST") {
        payload.domain = form.domain || null;
      } else if (form.role === "BUYER") {
        // la cumpărători ștergem domeniul
        payload.domain = null;
      }

      // dacă Auth0 NU are email (ex. login cu Facebook), permitem setarea email-ului manual
      if (!user?.email && form.email) {
        payload.email = form.email;
      }

      console.log("Payload trimis la /api/me (PUT):", payload);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log("Răspuns /api/me (PUT):", res.status, text);

      if (!res.ok) {
        setSaveStatus("error");
        return;
      }

      const updated = JSON.parse(text);
      setDbUser(updated);
      setSaveStatus("success");
    } catch (err) {
      console.error("onSave error:", err);
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  }

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

  // --- date pentru afișare ---
  const profileImage =
    user?.picture || "https://placehold.co/200x200/png?text=Avatar";

  const displayName = dbUser?.name || fullNameFromAuth0 || "Nume necompletat";

  const alias =
    dbUser?.username || // alias din DB, dacă există
    (displayName && displayName.split(" ")[0]) ||
    "User";

  const realName = displayName;

  const effectiveEmail =
    user?.email || dbUser?.email || "Email indisponibil (ex. login Facebook)";

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
            <p className="text-lg text-slate-700 mt-1">{alias}</p>

            <p className="text-sm text-slate-600 mt-2">
              Email: <span className="font-mono">{effectiveEmail}</span>
            </p>

            {loadingDbUser && (
              <p className="text-sm text-slate-500 mt-1">
                Loading...
              </p>
            )}

            {dbUser && (
              <div className="mt-2 text-sm text-slate-700 space-y-1">
                <p>
                  Role:{" "}
                  <span className="font-semibold">
                    {dbUser.role || "nesetat (BUYER / ARTIST)"}
                  </span>
                </p>
                <p>
                  Country:{" "}
                  <span className="font-semibold">
                    {dbUser.country || "nesetată"}
                  </span>
                </p>
                {dbUser.role === "ARTIST" && (
                  <p>
                    Domain:{" "}
                    <span className="font-semibold">
                      {dbUser.domain || "nesetat"}
                    </span>
                  </p>
                )}
                <p>
                  Languages:{" "}
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

              {/* buton nou: Edit Profile */}
              <button
                className={`neo-btn ${
                  tab === "edit" ? "neo-btn-active" : ""
                }`}
                onClick={() => setTab("edit")}
              >
                Edit Profile
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

              {tab === "edit" && (
                <div className="space-y-6">
                  <p className="text-slate-700 text-lg">
                    Editează-ți profilul public: rol, alias, țară, domeniu și
                    limbile vorbite.
                  </p>

                  <form
                    onSubmit={onSave}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {/* Alias */}
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-slate-800">
                        Alias (optional)
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={onChange}
                        className="border-4 border-slate-900 rounded-xl px-3 py-2 focus:outline-none"
                        placeholder="ex: IndieKid99"
                      />
                    </div>

                    {/* Rol */}
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-slate-800">
                        Role
                      </label>
                      <select
                        name="role"
                        value={form.role}
                        onChange={onChange}
                        className="border-4 border-slate-900 rounded-xl px-3 py-2 focus:outline-none bg-white"
                      >
                        <option value="">Nothing</option>
                        <option value="BUYER">Buyer (cumpărător)</option>
                        <option value="ARTIST">Artist</option>
                      </select>
                    </div>

                    {/* Country - Dropdown from JSON */}
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-slate-800">
                        Country
                      </label>

                      <select
                        name="country"
                        value={form.country}
                        onChange={onChange}
                        className="border-4 border-slate-900 rounded-xl px-3 py-2 bg-white"
                      >
                        <option value="">Select your country</option>

                        {countries.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    {form.role === "ARTIST" && (
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-slate-800">
                          Domain (for artists)
                        </label>

                        <select
                          name="domain"
                          value={form.domain}
                          onChange={onChange}
                          className="border-4 border-slate-900 rounded-xl px-3 py-2 bg-white"
                        >
                          <option value="">Select your main domain</option>

                          {domains.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-800">
                        Spoken languages
                      </label>

                      <select
                        multiple
                        name="languages"
                        value={form.languages ? form.languages.split(",") : []}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions).map(
                            (opt) => opt.value
                          );
                          setForm((prev) => ({
                            ...prev,
                            languages: selected.join(",")
                          }));
                        }}
                        className="border-4 border-slate-900 rounded-xl px-3 py-2 bg-white h-32"
                      >
                        {languagesList.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.name} ({lang.code})
                          </option>
                        ))}
                      </select>

                      <span className="text-xs text-slate-500">
                        Hold CTRL (or CMD on Mac) to select multiple languages.
                      </span>
                    </div>

                    {/* Email manual când Auth0 nu are */}
                    {!user?.email && (
                      <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-800">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={onChange}
                          className="border-4 border-slate-900 rounded-xl px-3 py-2 focus:outline-none"
                          placeholder="ex: nume@exemplu.com"
                        />
                        <span className="text-xs text-slate-500">
                          La unele logări sociale (ex. Facebook) email-ul nu este
                          trimis către aplicație. Îl poți seta manual aici pentru
                          contact.
                        </span>
                      </div>
                    )}

                    {/* Buton Save + mesaj status */}
                    <div className="md:col-span-2 flex items-center justify-between mt-2">
                      {saveStatus === "success" && (
                        <span className="text-sm font-semibold text-green-600">
                          Profil salvat cu succes ✅
                        </span>
                      )}
                      {saveStatus === "error" && (
                        <span className="text-sm font-semibold text-red-600">
                          A apărut o eroare la salvare. Verifică consola.
                        </span>
                      )}

                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-yellow-300 border-4 border-slate-900 rounded-xl font-bold shadow-[6px_6px_0_0_#0F172A] disabled:opacity-60"
                      >
                        {saving ? "Se salvează..." : "Salvează profilul"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
