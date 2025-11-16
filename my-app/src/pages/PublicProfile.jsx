// src/pages/PublicProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function PublicProfile() {
  const { alias } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    user.avatarUrl ||
    "https://placehold.co/200x200/png?text=Avatar";

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-slate-200 border-4 border-slate-900 rounded-3xl shadow-[12px_12px_0_0_#0F172A] p-8">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-10">
          <div className="h-40 w-40 rounded-full overflow-hidden bg-white border-4 border-slate-900 shadow-[6px_6px_0_0_#0F172A]">
            <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
          </div>

          <div>
            <h1 className="text-5xl font-bold text-slate-900">
              {user.name || "Unnamed User"}
            </h1>
            <p className="text-lg text-slate-700">(~{user.username})</p>

            <div className="mt-2 text-sm text-slate-700 space-y-1">
              <p>
                Role: <b>{user.role || "Unknown"}</b>
              </p>
              <p>
                Country: <b>{user.country || "Unknown"}</b>
              </p>
              {user.role === "ARTIST" && (
                <p>
                  Domain: <b>{user.domain || "Unknown"}</b>
                </p>
              )}
              <p>
                Languages: <b>{user.languages || "not specified"}</b>
              </p>
            </div>
          </div>
        </header>

        {/* POSTS SECTION */}
        <section className="bg-white border-4 border-slate-900 rounded-3xl p-6 shadow-[10px_10px_0_0_#0F172A]">
          <h2 className="text-2xl font-bold mb-4">Recent posts</h2>

          {!user.posts || user.posts.length === 0 ? (
            <p className="text-sm text-slate-600">
              This user has no posts yet.
            </p>
          ) : (
            <div className="space-y-4">
              {user.posts.map((post) => (
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
        </section>
      </div>
    </main>
  );
}
