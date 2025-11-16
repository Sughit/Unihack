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

  const [myRequests, setMyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [deliveryLinks, setDeliveryLinks] = useState({}); // { [reqId]: string }
  const [sendingDelivery, setSendingDelivery] = useState(false);

  // creațiile mele (portfolio)
  const [creations, setCreations] = useState([]);
  const [loadingCreations, setLoadingCreations] = useState(false);
  const [creationForm, setCreationForm] = useState({
    imageUrl: "",
    title: "",
    link: "",
    description: "",
  });
  const [editingCreationId, setEditingCreationId] = useState(null);
  const [savingCreation, setSavingCreation] = useState(false);


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


    // --- încarcă creațiile mele ---
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadMyCreations() {
      try {
        setLoadingCreations(true);
        const token = await getAccessTokenSilently();
        const res = await fetch(`${API_URL}/api/my-creations`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error("Error loading my creations:", await res.text());
          return;
        }

        const data = await res.json();
        setCreations(data);
      } catch (err) {
        console.error("loadMyCreations error:", err);
      } finally {
        setLoadingCreations(false);
      }
    }

    loadMyCreations();
  }, [isAuthenticated, getAccessTokenSilently]);

    // --- încarcă cererile mele ACCEPTATE ---
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadMyRequests() {
      try {
        setLoadingRequests(true);
        const token = await getAccessTokenSilently();
        const res = await fetch(`${API_URL}/api/my-project-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error("Error loading my project requests:", await res.text());
          return;
        }

        const data = await res.json();
        setMyRequests(data);
      } catch (err) {
        console.error("loadMyRequests error:", err);
      } finally {
        setLoadingRequests(false);
      }
    }

    loadMyRequests();
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
  function onChangeCreation(e) {
    const { name, value } = e.target;
    setCreationForm((prev) => ({ ...prev, [name]: value }));
  }

  function startEditCreation(c) {
    setEditingCreationId(c.id);
    setCreationForm({
      imageUrl: c.imageUrl || "",
      title: c.title || "",
      link: c.link || "",
      description: c.description || "",
    });
  }

  async function onSubmitCreation(e) {
    e.preventDefault();
    if (!creationForm.title.trim()) return;
    if (!isAuthenticated) return;

    try {
      setSavingCreation(true);
      const token = await getAccessTokenSilently();

      const payload = {
        title: creationForm.title,
        link: creationForm.link,
        imageUrl: creationForm.imageUrl,
        description: creationForm.description,
      };

      let res;
      if (editingCreationId) {
        res = await fetch(
          `${API_URL}/api/my-creations/${editingCreationId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );
      } else {
        res = await fetch(`${API_URL}/api/my-creations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        console.error("Error saving creation:", await res.text());
        return;
      }

      const saved = await res.json();

      if (editingCreationId) {
        setCreations((prev) =>
          prev.map((c) => (c.id === saved.id ? saved : c))
        );
      } else {
        setCreations((prev) => [saved, ...prev]);
      }

      setCreationForm({
        imageUrl: "",
        title: "",
        link: "",
        description: "",
      });
      setEditingCreationId(null);
    } catch (err) {
      console.error("onSubmitCreation error:", err);
    } finally {
      setSavingCreation(false);
    }
  }

  async function onDeleteCreation(id) {
    if (!window.confirm("Delete this creation?")) return;
    if (!isAuthenticated) return;

    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${API_URL}/api/my-creations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Error deleting creation:", await res.text());
        return;
      }

      setCreations((prev) => prev.filter((c) => c.id !== id));

      if (editingCreationId === id) {
        setEditingCreationId(null);
        setCreationForm({
          imageUrl: "",
          title: "",
          link: "",
          description: "",
        });
      }
    } catch (err) {
      console.error("onDeleteCreation error:", err);
    }
  }

  async function sendDeliveryLink(req) {
    if (!dbUser || dbUser.role !== "ARTIST") return;
    if (!req.buyer || !req.buyer.id) return;

    const link = (deliveryLinks[req.id] || "").trim();
    if (!link) {
      alert("Please enter a delivery link first.");
      return;
    }

    try {
      setSendingDelivery(true);
      const token = await getAccessTokenSilently();
      const res = await fetch(`${API_URL}/api/project-requests/deliver`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          buyerId: req.buyer.id,
          link,
        }),
      });

      if (!res.ok) {
        console.error("Error sending delivery link:", await res.text());
        return;
      }

      const updated = await res.json();

      // actualizăm în listă
      setMyRequests((prev) =>
        prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r))
      );

      // reset input pentru cererea respectivă
      setDeliveryLinks((prev) => ({ ...prev, [req.id]: "" }));
    } catch (err) {
      console.error("sendDeliveryLink error:", err);
    } finally {
      setSendingDelivery(false);
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

              {dbUser?.role === "ARTIST" && (
                <button
                  className={`neo-btn ${
                    tab === "creations" ? "neo-btn-active" : ""
                  }`}
                  onClick={() => setTab("creations")}
                >
                  Creations
                </button>
              )}

              <button
                className={`neo-btn ${
                  tab === "request" ? "neo-btn-active" : ""
                }`}
                onClick={() => setTab("request")}
              >
                Requests
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
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Your creations
                  </h2>

                  {/* FORMULAR – ca în schița ta */}
                  <form
                    onSubmit={onSubmitCreation}
                    className="bg-slate-100 border-4 border-slate-900 rounded-2xl p-4 shadow-[6px_6px_0_0_#0F172A] space-y-3"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-[120px,1fr,1fr,1fr] gap-3 items-stretch">
                      {/* IMG preview */}
                   

                      {/* TITLE */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                          Title
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={creationForm.title}
                          onChange={onChangeCreation}
                          className="border-4 border-slate-900 rounded-xl px-3 py-2 text-sm bg-white"
                          placeholder="Project title"
                        />
                      </div>

                      {/* LINK */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                          Link
                        </label>
                        <input
                          type="url"
                          name="link"
                          value={creationForm.link}
                          onChange={onChangeCreation}
                          className="border-4 border-slate-900 rounded-xl px-3 py-2 text-sm bg-white"
                          placeholder="https://behance.net/..."
                        />
                      </div>

                      {/* IMAGE URL */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                          Image URL
                        </label>
                        <input
                          type="url"
                          name="imageUrl"
                          value={creationForm.imageUrl}
                          onChange={onChangeCreation}
                          className="border-4 border-slate-900 rounded-xl px-3 py-2 text-sm bg-white"
                          placeholder="https://image.host/cover.png"
                        />
                      </div>
                    </div>

                    {/* DESCRIPTION + POST / SAVE */}
                    <div className="grid grid-cols-[1fr,auto] gap-3 items-end">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                          Description
                        </label>
                        <textarea
                          name="description"
                          rows={3}
                          value={creationForm.description}
                          onChange={onChangeCreation}
                          className="border-4 border-slate-900 rounded-xl px-3 py-2 text-sm bg-white resize-none"
                          placeholder="Describe this creation, tools, style, etc."
                        />
                      </div>

                      <div className="flex flex-col items-stretch gap-2">
                        <button
                          type="submit"
                          disabled={savingCreation}
                          className="px-4 py-2 bg-yellow-300 border-4 border-slate-900 rounded-xl font-bold text-sm shadow-[4px_4px_0_0_#0F172A] disabled:opacity-60"
                        >
                          {savingCreation
                            ? "Saving..."
                            : editingCreationId
                            ? "Save"
                            : "Post"}
                        </button>

                        {editingCreationId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCreationId(null);
                              setCreationForm({
                                imageUrl: "",
                                title: "",
                                link: "",
                                description: "",
                              });
                            }}
                            className="px-4 py-1 bg-white border-4 border-slate-900 rounded-xl font-semibold text-xs shadow-[3px_3px_0_0_#0F172A]"
                          >
                            Cancel edit
                          </button>
                        )}
                      </div>
                    </div>
                  </form>

                  {/* LISTĂ CREAȚII EXISTENTE */}
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {loadingCreations ? (
                      <p className="text-sm text-slate-600">
                        Loading your creations...
                      </p>
                    ) : creations.length === 0 ? (
                      <p className="text-sm text-slate-600">
                        You haven&apos;t added any creations yet.
                      </p>
                    ) : (
                      creations.map((c) => (
                        <article
                          key={c.id}
                          className="bg-slate-100 border-4 border-slate-900 rounded-2xl px-4 py-3 shadow-[4px_4px_0_0_#0F172A] flex flex-col md:flex-row gap-4"
                        >
                          {c.imageUrl && (
                            <div className="h-24 w-24 md:h-28 md:w-28 rounded-xl overflow-hidden border-4 border-slate-900 bg-white">
                              <img
                                src={c.imageUrl}
                                alt={c.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}

                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900">
                              {c.title}
                            </h3>
                            {c.link && (
                              <a
                                href={c.link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-blue-600 underline break-all"
                              >
                                {c.link}
                              </a>
                            )}
                            {c.createdAt && (
                              <p className="text-[11px] text-slate-500 mt-1">
                                {new Date(c.createdAt).toLocaleString()}
                              </p>
                            )}
                            {c.description && (
                              <p className="text-sm text-slate-800 mt-1 whitespace-pre-wrap">
                                {c.description}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-row md:flex-col gap-2 items-end">
                            <button
                              type="button"
                              onClick={() => startEditCreation(c)}
                              className="px-3 py-1 text-xs bg-white border-3 border-slate-900 rounded-xl font-semibold shadow-[3px_3px_0_0_#0F172A]"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteCreation(c.id)}
                              className="px-3 py-1 text-xs bg-red-500 text-white border-3 border-slate-900 rounded-xl font-semibold shadow-[3px_3px_0_0_#0F172A]"
                            >
                              Delete
                            </button>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              )}


              {tab === "request" && (
                <div>
                  {dbUser?.role === "ARTIST" ? (
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                      Project requests in progress (accepted)
                    </h2>
                  ) : (
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                      Your accepted project requests
                    </h2>
                  )}

                  {loadingRequests ? (
                    <p className="text-sm text-slate-600">Loading project requests...</p>
                  ) : myRequests.length === 0 ? (
                    <p className="text-sm text-slate-600">
                      {dbUser?.role === "ARTIST"
                        ? "You don't have any accepted project requests yet."
                        : "You don't have any accepted project requests yet."}
                    </p>
                  ) : (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                      {myRequests.map((req) => (
                        <article
                          key={req.id}
                          className="bg-slate-100 border-4 border-slate-900 rounded-2xl px-4 py-3 shadow-[4px_4px_0_0_#0F172A]"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-lg font-bold text-slate-900">
                              {dbUser?.role === "ARTIST"
                                ? `Buyer: ${req.buyer?.name || "Unknown"}`
                                : `Artist: ${req.artist?.name || "Unknown"}`}
                            </h3>
                            <span className="text-xs font-semibold text-slate-700 uppercase">
                              {req.status}
                            </span>
                          </div>

                          <p className="text-sm text-slate-800">
                            <span className="font-semibold">Budget:</span>{" "}
                            {req.budget}
                          </p>

                          {req.deadline && (
                            <p className="text-sm text-slate-800">
                              <span className="font-semibold">Deadline:</span>{" "}
                              {new Date(req.deadline).toLocaleDateString()}
                            </p>
                          )}

                          {req.notes && (
                            <p className="text-sm text-slate-800 mt-1 whitespace-pre-wrap">
                              <span className="font-semibold">Details:</span>{" "}
                              {req.notes}
                            </p>
                          )}

                          {/* 🔹 Delivery link vizibil pentru ambele roluri dacă există */}
                          {req.deliveryLink && (
                            <p className="text-sm text-slate-800 mt-2">
                              <span className="font-semibold">
                                Delivery link:
                              </span>{" "}
                              <a
                                href={req.deliveryLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 underline break-all"
                              >
                                {req.deliveryLink}
                              </a>
                              {req.deliveredAt && (
                                <span className="text-xs text-slate-500 ml-2">
                                  (sent{" "}
                                  {new Date(
                                    req.deliveredAt
                                  ).toLocaleString()}
                                  )
                                </span>
                              )}
                            </p>
                          )}

                          {/* 🔹 Dacă e ARTIST și NU există încă delivery link -> input + buton */}
                          {dbUser?.role === "ARTIST" && !req.deliveryLink && (
                            <div className="mt-3 flex flex-col gap-2">
                              <label className="text-xs font-semibold text-slate-700">
                                Delivery link for this project
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="url"
                                  placeholder="https://my-portfolio.com/project-file"
                                  value={deliveryLinks[req.id] || ""}
                                  onChange={(e) =>
                                    setDeliveryLinks((prev) => ({
                                      ...prev,
                                      [req.id]: e.target.value,
                                    }))
                                  }
                                  className="flex-1 border-4 border-slate-900 rounded-xl px-3 py-1 text-sm bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => sendDeliveryLink(req)}
                                  disabled={sendingDelivery}
                                  className="px-3 py-1 bg-green-300 border-4 border-slate-900 rounded-xl text-xs font-bold shadow-[3px_3px_0_0_#0F172A] disabled:opacity-60"
                                >
                                  {sendingDelivery
                                    ? "Sending..."
                                    : "Send link"}
                                </button>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Paste here the URL to the final files (Drive,
                                Behance, Figma, etc.). The buyer will see it in
                                their Requests tab.
                              </p>
                            </div>
                          )}

                          <p className="text-xs text-slate-500 mt-2">
                            Created at:{" "}
                            {req.createdAt
                              ? new Date(req.createdAt).toLocaleString()
                              : "-"}
                          </p>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
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
