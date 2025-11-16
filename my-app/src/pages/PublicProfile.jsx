// src/pages/PublicProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function PublicProfile() {
  const { alias } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("posts");

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_URL}/api/public-profile/${alias}`);
        if (!res.ok) {
          throw new Error("User not found");
        }

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Public profile error:", err);
        setError("This profile does not exist.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [alias]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="px-8 py-6 bg-white border-4 border-slate-900 rounded-3xl shadow-[8px_8px_0_0_#0F172A]">
          <p className="text-xl font-bold">Loading profile…</p>
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="max-w-md w-full rounded-[2.75rem] border-[4px] border-slate-900 bg-white px-8 py-10 shadow-[8px_8px_0_0_rgba(15,23,42,1)]">
          <h1 className="text-4xl font-black text-slate-900 mb-3">
            Profile not found
          </h1>
          <p className="text-sm text-slate-700 mb-6">
            We couldn&apos;t find the profile <b>~{alias}</b>.
          </p>
          <Link to="/search" className="nb-btn nav-btn-primary">
            Search artists
          </Link>
        </div>
      </main>
    );
  }

  const avatar =
    user.avatarUrl || "https://placehold.co/200x200/png?text=Avatar";

  const posts = user.posts || [];
  const creations = user.creations || []; // 👈 vine din backend acum

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-slate-200 border-4 border-slate-900 rounded-3xl shadow-[12px_12px_0_0_#0F172A] p-8">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
          <div className="h-40 w-40 rounded-full overflow-hidden bg-white border-4 border-slate-900 shadow-[6px_6px_0_0_#0F172A]">
            <img
              src={avatar}
              alt="avatar"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex-1">
            <h1 className="text-5xl font-bold text-slate-900">
              {user.name || "Unnamed User"}
            </h1>
            <p className="text-lg text-slate-700 mt-1">(~{user.username})</p>

            <div className="mt-3 text-sm text-slate-700 space-y-1">
              <p>
                Role:{" "}
                <span className="font-semibold">{user.role || "Unknown"}</span>
              </p>
              <p>
                Country:{" "}
                <span className="font-semibold">
                  {user.country || "Unknown"}
                </span>
              </p>
              {user.role === "ARTIST" && (
                <p>
                  Domain:{" "}
                  <span className="font-semibold">
                    {user.domain || "Unknown"}
                  </span>
                </p>
              )}
              <p>
                Languages:{" "}
                <span className="font-semibold">
                  {user.languages || "not specified"}
                </span>
              </p>
            </div>
          </div>
        </header>

        {/* BODY */}
        <section className="flex flex-col md:flex-row gap-8">
          {/* MENIU STÂNGA */}
          <aside className="w-full md:w-64 bg-slate-100 border-4 border-slate-900 rounded-3xl shadow-[8px_8px_0_0_#0F172A] p-4">
            <nav className="flex flex-col gap-4">
              <button
                className={`neo-btn ${tab === "posts" ? "neo-btn-active" : ""}`}
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

          {/* CONȚINUT DREAPTA */}
          <div className="flex-1">
            <div className="bg-white border-4 border-slate-900 rounded-3xl p-6 shadow-[10px_10px_0_0_#0F172A] min-h-[260px]">
              {/* POSTS */}
              {tab === "posts" && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Recent posts</h2>

                  {posts.length === 0 ? (
                    <p className="text-sm text-slate-600">
                      This user has no posts yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {posts.map((post) => (
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
                          <p className="text-sm text-slate-800 whitespace-pre-wrap">
                            {post.content}
                          </p>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* CREATIONS – read only, dar cu același stil ca în Profile */}
              {tab === "creations" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-4">Creations</h2>

                  {creations.length === 0 ? (
                    <p className="text-sm text-slate-600">
                      This artist hasn&apos;t added any public creations yet.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                      {creations.map((c) => (
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
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* CONTACT */}
              {tab === "contact" && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Contact</h2>

                  <div className="space-y-2 text-sm text-slate-800">
                    <p>
                      Name:{" "}
                      <span className="font-semibold">
                        {user.name || "Not specified"}
                      </span>
                    </p>
                    <p>
                      Alias:{" "}
                      <span className="font-mono">~{user.username}</span>
                    </p>
                    <p>
                      Role:{" "}
                      <span className="font-semibold">
                        {user.role || "Unknown"}
                      </span>
                    </p>
                    <p>
                      Country:{" "}
                      <span className="font-semibold">
                        {user.country || "Unknown"}
                      </span>
                    </p>
                    {user.email && (
                      <p>
                        Email:{" "}
                        <span className="font-mono">{user.email}</span>
                      </p>
                    )}
                    {!user.email && (
                      <p className="text-xs text-slate-500">
                        This user has not shared a public email address.
                      </p>
                    )}
                  </div>

                  <p className="mt-4 text-xs text-slate-500">
                    Tip: use the platform&apos;s chat feature to contact this
                    artist safely. Never share sensitive data or payments
                    outside trusted channels.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
