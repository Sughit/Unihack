// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import countries from "../assets/countries.json";
import domains from "../assets/domains.json";
import languagesList from "../assets/languages.json";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Profile() {
  const [tab, setTab] = useState("posts");

  const [dbUser, setDbUser] = useState(null);
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
    avatarUrl: "", // 🔥 nou
  });

  // postările mele
  const [myPosts, setMyPosts] = useState([]);
  const [loadingMyPosts, setLoadingMyPosts] = useState(false);

  // 🔥 state pentru badge-uri blockchain
  const [badgeLoading, setBadgeLoading] = useState(false);
  const [badgeMessage, setBadgeMessage] = useState("");

  const { user, isLoading, isAuthenticated, getAccessTokenSilently } =
    useAuth0();

  // nume complet din claim custom + fallback-uri
  const fullNameFromAuth0 =
    user?.["https://creon.app/full_name"] ||
    user?.name ||
    user?.nickname ||
    user?.username ||
    (user?.email ? user.email.split("@")[0] : "");

  // --- sincronizare user <-> DB ---
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    async function syncUser() {
      try {
        setLoadingDbUser(true);
        const token = await getAccessTokenSilently();

        // 1. GET /api/me
        const res = await fetch(`${API_URL}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error("Eroare la /api/me (GET):", await res.text());
          return;
        }

        let data = await res.json();

        // 2. trimitem nume + email (dacă există)
        const currentEmail = user?.email || data.email || null;
        const currentName = fullNameFromAuth0 || data.name || null;

        const putRes = await fetch(`${API_URL}/api/me`, {
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
          data = await putRes.json();
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

  // --- populate form când avem dbUser ---
  useEffect(() => {
    if (!dbUser) return;

    const userEmail = user?.email || "";

    setForm({
      username: dbUser.username || "",
      role: dbUser.role || "",
      country: dbUser.country || "",
      domain: dbUser.domain || "",
      languages: dbUser.languages || "",
      email: userEmail || dbUser.email || "",
      avatarUrl: dbUser.avatarUrl || "", // 🔥 nou
    });
  }, [dbUser, user]);

  // --- încarcă postările mele ---
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadMyPosts() {
      try {
        setLoadingMyPosts(true);
        const token = await getAccessTokenSilently();
        const res = await fetch(`${API_URL}/api/my-posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error("Error loading my posts:", await res.text());
          return;
        }

        const data = await res.json();
        setMyPosts(data);
      } catch (err) {
        console.error("loadMyPosts error:", err);
      } finally {
        setLoadingMyPosts(false);
      }
    }

    loadMyPosts();
  }, [isAuthenticated, getAccessTokenSilently]);

  // --- handlers formular edit ---
  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSaveStatus(null);
  }

  async function onSave(e) {
    e.preventDefault();
    if (!dbUser) return;

    try {
      setSaving(true);
      setSaveStatus(null);

      const token = await getAccessTokenSilently();

      const payload = {
        username: form.username || null,
        role: form.role || null,
        country: form.country || null,
        languages: form.languages || null,
        avatarUrl: form.avatarUrl || null, // 🔥 nou
      };

      if (form.role === "ARTIST") {
        payload.domain = form.domain || null;
      } else if (form.role === "BUYER") {
        payload.domain = null;
      }

      if (!user?.email && form.email) {
        payload.email = form.email;
      }

      const res = await fetch(`${API_URL}/api/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      if (!res.ok) {
        console.error("Eroare la /api/me (PUT):", res.status, text);
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

  // 🔥 funcție: acordă badge „artist_verified” pe blockchain
  async function handleAwardArtistBadge() {
    try {
      setBadgeLoading(true);
      setBadgeMessage("");

      const token = await getAccessTokenSilently();

      const res = await fetch(`${API_URL}/api/badges/award`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ badgeType: "artist_verified" }),
      });

      const data = await res.json();
      console.log("Badge response:", data);

      if (!res.ok || !data.ok) {
        setBadgeMessage(
          data.error || "Nu s-a putut acorda badge-ul (vezi consola)."
        );
        return;
      }

      setBadgeMessage(
        `Badge acordat! Poți vedea tranzacția aici: ${data.explorerUrl}`
      );
    } catch (err) {
      console.error("handleAwardArtistBadge error:", err);
      setBadgeMessage("Eroare la acordarea badge-ului.");
    } finally {
      setBadgeLoading(false);
    }
  }

  // --- loading Auth0 ---
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

  // --- not logged in ---
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

  // --- info afișare ---
  const profileImage =
    form.avatarUrl ||
    dbUser?.avatarUrl ||
    user?.picture ||
    "https://placehold.co/200x200/png?text=Avatar";

  const displayName = dbUser?.name || fullNameFromAuth0 || "Nume necompletat";

  const alias =
    dbUser?.username || (displayName && displayName.split(" ")[0]) || "User";

  const realName = displayName;

  const effectiveEmail = user?.email || dbUser?.email || "Email indisponibil";

  return (
    <main className="min-h-screen w-full bg-slate-100 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-6xl bg-slate-200 border-4 border-slate-900 rounded-3xl shadow-[12px_12px_0_0_#0F172A] p-8">
        {/* HEADER */}
        <header className="flex items-start gap-6 mb-10">
          <div className="h-40 w-40 rounded-full overflow-hidden bg-white border-4 border-slate-900 shadow-[6px_6px_0_0_#0F172A]">
            <img
              src={profileImage}
              alt="avatar"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex-1">
            <h1 className="text-5xl font-bold text-slate-900">{realName}</h1>
            <p className="text-lg text-slate-700 mt-1">({alias})</p>

            <p className="text-sm text-slate-600 mt-2">
              Email: <span className="font-mono">{effectiveEmail}</span>
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
                  Country:{" "}
                  <span className="font-semibold">
                    {dbUser.country || "not set"}
                  </span>
                </p>
                {dbUser.role === "ARTIST" && (
                  <p>
                    Domain:{" "}
                    <span className="font-semibold">
                      {dbUser.domain || "not set"}
                    </span>
                  </p>
                )}
                <p>
                  Languages:{" "}
                  <span className="font-semibold">
                    {dbUser.languages || "not specified"}
                  </span>
                </p>
              </div>
            )}

       {/* 🔥 Blockchain badge button */}

{/*
        <div className="mt-4 space-y-2">
              <button
                onClick={handleAwardArtistBadge}
                disabled={badgeLoading}
                className="px-4 py-2 border-4 border-slate-900 bg-yellow-300 rounded-full shadow-[6px_6px_0_0_#0F172A] text-sm font-semibold disabled:opacity-60"
              >
                {badgeLoading
                  ? "Acord badge..."
                  : "Acordă badge „Artist Verified”"}
              </button>

              {badgeMessage && (
                <p className="text-xs text-slate-700 break-all">
                  {badgeMessage}
                </p>
              )}
            </div>
            */}
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
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    Your posts
                  </h2>
                  {loadingMyPosts ? (
                    <p className="text-sm text-slate-600">
                      Loading your posts...
                    </p>
                  ) : myPosts.length === 0 ? (
                    <p className="text-sm text-slate-600">
                      You don't have any posts yet.
                    </p>
                  ) : (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                      {myPosts.map((post) => (
                        <article
                          key={post.id}
                          className="bg-slate-100 border-4 border-slate-900 rounded-2xl px-4 py-3 shadow-[4px_4px_0_0_#0F172A]"
                        >
                          <h3 className="text-lg font-bold text-slate-900">
                            {post.title || "(untitled)"}
                          </h3>
                          <p className="text-xs text-slate-500 mb-1">
                            {post.createdAt
                              ? new Date(post.createdAt).toLocaleString()
                              : ""}
                          </p>
                          <p className="text-sm text-slate-800 mb-2 whitespace-pre-wrap">
                            {post.content}
                          </p>
                          <p className="text-xs text-slate-600">
                            {post.likeCount} likes ·{" "}
                            {post.commentCount || 0} comments
                          </p>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
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
                    Edit your public profile: role, alias, country, domain,
                    spoken languages and profile image.
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

                    {/* Role */}
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
                        <option value="">Not set</option>
                        <option value="BUYER">Buyer</option>
                        <option value="ARTIST">Artist</option>
                      </select>
                    </div>

                    {/* Country */}
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

                    {/* Domain - only ARTIST */}
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

                    {/* Profile image URL */}
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-800">
                        Profile image URL
                      </label>
                      <input
                        type="url"
                        name="avatarUrl"
                        value={form.avatarUrl}
                        onChange={onChange}
                        className="border-4 border-slate-900 rounded-xl px-3 py-2 focus:outline-none"
                        placeholder="https://example.com/my-avatar.png"
                      />
                      <span className="text-xs text-slate-500">
                        Paste here a direct link to an image (PNG/JPEG). We’ll
                        use it as your profile picture.
                      </span>

                      {form.avatarUrl && (
                        <div className="mt-3 inline-flex items-center gap-3">
                          <div className="h-16 w-16 rounded-full overflow-hidden border-4 border-slate-900 shadow-[4px_4px_0_0_#0F172A] bg-white">
                            <img
                              src={form.avatarUrl}
                              alt="Preview avatar"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span className="text-xs text-slate-500">
                            Preview of your new profile image.
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Languages */}
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-800">
                        Spoken languages
                      </label>

                      <select
                        multiple
                        name="languages"
                        value={form.languages ? form.languages.split(",") : []}
                        onChange={(e) => {
                          const selected = Array.from(
                            e.target.selectedOptions
                          ).map((opt) => opt.value);
                          setForm((prev) => ({
                            ...prev,
                            languages: selected.join(","),
                          }));
                          setSaveStatus(null);
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

                    {/* Email manual doar dacă nu vine din Auth0 */}
                    {!user?.email && (
                      <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-800">
                          Email (optional, for contact)
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={onChange}
                          className="border-4 border-slate-900 rounded-xl px-3 py-2 focus:outline-none"
                          placeholder="ex: name@example.com"
                        />
                        <span className="text-xs text-slate-500">
                          Some social logins (e.g. Facebook) do not provide
                          your email. You can set it manually here.
                        </span>
                      </div>
                    )}

                    {/* Save button + status */}
                    <div className="md:col-span-2 flex items-center justify-between mt-2">
                      {saveStatus === "success" && (
                        <span className="text-sm font-semibold text-green-600">
                          Profile saved successfully ✅
                        </span>
                      )}
                      {saveStatus === "error" && (
                        <span className="text-sm font-semibold text-red-600">
                          Error while saving profile. Check console.
                        </span>
                      )}

                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-yellow-300 border-4 border-slate-900 rounded-xl font-bold shadow-[6px_6px_0_0_#0F172A] disabled:opacity-60"
                      >
                        {saving ? "Saving..." : "Save profile"}
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
