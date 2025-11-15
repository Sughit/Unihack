import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Dummy data pentru artiști și chat-uri (deocamdată)
const dummyArtists = [
  { id: 1, name: "Indie Visuals", domain: "Illustration" },
  { id: 2, name: "Neon Beats", domain: "Music Production" },
  { id: 3, name: "Pixel Motion", domain: "3D Graphics" },
];

const dummyChats = [
  { id: 1, name: "Indie Visuals", lastMessage: "Let’s finalize the cover art!", unread: 2 },
  { id: 2, name: "Neon Beats", lastMessage: "Sending the second draft tonight.", unread: 0 },
  { id: 3, name: "Pixel Motion", lastMessage: "Do you prefer a darker color palette?", unread: 1 },
];

export default function Main() {
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();

  const [activeChat, setActiveChat] = useState(null);

  const [composer, setComposer] = useState({
    title: "",
    content: "",
  });

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Încarcă feed-ul de postări din backend
  useEffect(() => {
    if (!isAuthenticated) {
      setPosts([]);
      setLoadingPosts(false);
      return;
    }

    async function loadFeed() {
      try {
        setLoadingPosts(true);
        const token = await getAccessTokenSilently();
        const res = await fetch(`${API_URL}/api/feed`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error("Error loading feed:", await res.text());
          return;
        }

        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("loadFeed error:", err);
      } finally {
        setLoadingPosts(false);
      }
    }

    loadFeed();
  }, [isAuthenticated, getAccessTokenSilently]);

  // Update pentru formularul de postare
  function handleComposerChange(e) {
    const { name, value } = e.target;
    setComposer((prev) => ({ ...prev, [name]: value }));
  }

  // Creează o postare nouă
  async function handlePost(e) {
    e.preventDefault();
    if (!composer.title.trim() && !composer.content.trim()) return;

    if (!isAuthenticated) {
      alert("You need to be logged in to create a post.");
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: composer.title,
          content: composer.content,
        }),
      });

      if (!res.ok) {
        console.error("Error creating post:", await res.text());
        alert("Error creating post.");
        return;
      }

      const newPost = await res.json();

      // adăugăm imediat în feed
      setPosts((prev) => [
        {
          id: newPost.id,
          title: newPost.title,
          content: newPost.content,
          createdAt: newPost.createdAt,
          likeCount: 0,
          likedByMe: false,
          authorName:
            user?.nickname ||
            user?.name ||
            user?.email ||
            "You",
        },
        ...prev,
      ]);

      setComposer({ title: "", content: "" });
    } catch (err) {
      console.error("handlePost error:", err);
      alert("Error creating post.");
    }
  }

  // Like / unlike post
  async function toggleLike(postId) {
    if (!isAuthenticated) {
      alert("You need to be logged in to like posts.");
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${API_URL}/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Error toggling like:", await res.text());
        return;
      }

      const data = await res.json(); // { liked, likeCount }

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likedByMe: data.liked, likeCount: data.likeCount }
            : p
        )
      );
    } catch (err) {
      console.error("toggleLike error:", err);
    }
  }

  return (
    <main className="min-h-screen w-full bg-slate-100 flex justify-center py-8 px-4">
      <div className="w-full max-w-6xl flex flex-col gap-6 lg:flex-row">
        {/* STÂNGA — Following artists */}
        <aside className="w-full lg:w-1/4 bg-slate-200 border-4 border-slate-900 rounded-3xl shadow-[8px_8px_0_0_#0F172A] p-4">
          <h2 className="text-xl font-bold text-slate-900 mb-3">
            Following
          </h2>
          <div className="space-y-2">
            {dummyArtists.map((artist) => (
              <div
                key={artist.id}
                className="flex flex-col gap-1 bg-white border-4 border-slate-900 rounded-2xl px-3 py-2 shadow-[4px_4px_0_0_#0F172A]"
              >
                <div className="font-semibold text-slate-900">
                  {artist.name}
                </div>
                <div className="text-xs text-slate-600">
                  {artist.domain}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* MIJLOC — Composer + Feed */}
        <section className="flex-1 flex flex-col gap-6">
          {/* Composer */}
          <div className="bg-slate-200 border-4 border-slate-900 rounded-3xl p-4 shadow-[8px_8px_0_0_#0F172A]">
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Create a new post
            </h2>
            {!isAuthenticated && (
              <p className="text-sm text-red-600 mb-2">
                You must be logged in to post.
              </p>
            )}
            <form onSubmit={handlePost} className="space-y-3">
              <input
                type="text"
                name="title"
                value={composer.title}
                onChange={handleComposerChange}
                className="w-full border-4 border-slate-900 rounded-2xl px-3 py-2 bg-white focus:outline-none"
                placeholder="Title (optional but recommended)"
              />
              <textarea
                name="content"
                value={composer.content}
                onChange={handleComposerChange}
                rows={4}
                className="w-full border-4 border-slate-900 rounded-2xl px-3 py-2 bg-white focus:outline-none resize-none"
                placeholder="Share what you're working on, what you need, or ideas for collaboration..."
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!isAuthenticated}
                  className="px-5 py-2 bg-yellow-300 border-4 border-slate-900 rounded-2xl font-bold shadow-[4px_4px_0_0_#0F172A] disabled:opacity-60"
                >
                  Post
                </button>
              </div>
            </form>
          </div>

          {/* Feed posts */}
          <div className="bg-slate-200 border-4 border-slate-900 rounded-3xl p-4 shadow-[8px_8px_0_0_#0F172A]">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Feed
            </h2>

            <div className="space-y-4">
              {loadingPosts ? (
                <p className="text-sm text-slate-600">Loading feed...</p>
              ) : posts.length === 0 ? (
                <p className="text-sm text-slate-600">
                  No posts yet. Create the first one!
                </p>
              ) : (
                posts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white border-4 border-slate-900 rounded-2xl px-4 py-3 shadow-[4px_4px_0_0_#0F172A]"
                  >
                    <h3 className="text-lg font-bold text-slate-900">
                      {post.title || "(untitled)"}
                    </h3>
                    <p className="text-xs text-slate-500 mb-1">
                      by {post.authorName} ·{" "}
                      {post.createdAt
                        ? new Date(post.createdAt).toLocaleString()
                        : ""}
                    </p>
                    <p className="text-sm text-slate-800 mb-3 whitespace-pre-wrap">
                      {post.content}
                    </p>

                    <div className="flex items-center gap-4 text-sm">
                      <button
                        type="button"
                        onClick={() => toggleLike(post.id)}
                        className={`border-2 border-slate-900 rounded-full px-3 py-1 shadow-[3px_3px_0_0_#0F172A] ${
                          post.likedByMe
                            ? "bg-slate-900 text-yellow-300"
                            : "bg-yellow-300 text-slate-900"
                        }`}
                      >
                        {post.likedByMe ? "Unlike" : "Like"} ({post.likeCount})
                      </button>

                      <button
                        type="button"
                        className="border-2 border-slate-900 rounded-full px-3 py-1 bg-white text-slate-900 shadow-[3px_3px_0_0_#0F172A]"
                      >
                        Comments
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        {/* DREAPTA — Recent chats + popup chat */}
        <aside className="w-full lg:w-1/4 bg-slate-200 border-4 border-slate-900 rounded-3xl shadow-[8px_8px_0_0_#0F172A] p-4 relative">
          <h2 className="text-xl font-bold text-slate-900 mb-3">
            Recent chats
          </h2>

          <div className="space-y-2">
            {dummyChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className="w-full flex flex-col items-start bg-white border-4 border-slate-900 rounded-2xl px-3 py-2 shadow-[4px_4px_0_0_#0F172A] text-left"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-slate-900">
                    {chat.name}
                  </span>
                  {chat.unread > 0 && (
                    <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5">
                      {chat.unread}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {chat.lastMessage}
                </p>
              </button>
            ))}
          </div>

          {/* Popup chat în dreapta jos */}
          {activeChat && (
            <div className="hidden lg:block fixed bottom-4 right-4 w-80 bg-slate-200 border-4 border-slate-900 rounded-3xl shadow-[8px_8px_0_0_#0F172A] p-3 z-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900">
                  Chat with {activeChat.name}
                </h3>
                <button
                  onClick={() => setActiveChat(null)}
                  className="text-xs border-2 border-slate-900 rounded-full px-2 py-0.5 bg-white"
                >
                  X
                </button>
              </div>
              <div className="h-32 bg-white border-2 border-slate-900 rounded-2xl mb-2 px-2 py-1 text-xs text-slate-600 overflow-y-auto">
                <p>
                  (Demo) Chat content here. Later we will connect this to
                  real-time messages.
                </p>
              </div>
              <input
                type="text"
                placeholder="Type a message..."
                className="w-full border-2 border-slate-900 rounded-2xl px-2 py-1 text-sm bg-white focus:outline-none"
              />
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
