// src/pages/Main.jsx
import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Main() {
  const {
    isAuthenticated,
    getAccessTokenSilently,
    user,
    loginWithRedirect,
  } = useAuth0();

  // FOLLOWING
  const [following, setFollowing] = useState([]);
  const [loadingFollowing, setLoadingFollowing] = useState(true);

  const [chatUsers, setChatUsers] = useState([]);
  const [loadingChatUsers, setLoadingChatUsers] = useState(true);

  // CHAT
  const [activeChatUser, setActiveChatUser] = useState(null); // {id, name}
  const [chatMessages, setChatMessages] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatInput, setChatInput] = useState("");

  // 🔹 info despre mine (pt rol BUYER/ARTIST)
  const [me, setMe] = useState(null);

  // 🔹 formular cerere proiect
  const [requestBudget, setRequestBudget] = useState("");
  const [requestDeadline, setRequestDeadline] = useState("");
  const [requestNotes, setRequestNotes] = useState("");
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  // POSTS
  const [composer, setComposer] = useState({ title: "", content: "" });
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // COMMENTS
  const [commentInputs, setCommentInputs] = useState({});

  const [handledRequests, setHandledRequests] = useState({}); // { [messageId]: "ACCEPTED" | "DENIED" }

  // ===== Helper pentru erori Auth0 (consent / login) =====
  function handleAuth0Error(err) {
    console.error("Auth0 error:", err);

    const code =
      err?.error ||
      (typeof err?.message === "string" ? err.message : "");

    if (
      code?.includes("consent_required") ||
      code?.includes("login_required") ||
      code?.includes("interaction_required")
    ) {
      // forțăm redirect cu prompt=consent ca să accepte o dată pentru totdeauna
      loginWithRedirect({
        authorizationParams: {
          prompt: "consent",
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: "openid profile email offline_access",
        },
      });
    }
  }

  function isProjectRequestMessage(m) {
    return m.text && m.text.startsWith("📌 PROJECT REQUEST");
  }

  async function respondToProjectRequest(decision, messageId) {
    if (!activeChatUser || !me) return;

    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${API_URL}/api/project-requests/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          buyerId: activeChatUser.id,
          decision,
        }),
      });

      if (!res.ok) {
        console.error("Error responding to project request:", await res.text());
        return;
      }

      // marcăm local că am tratat cererea pentru mesajul ăsta
      setHandledRequests((prev) => ({
        ...prev,
        [messageId]: decision,
      }));
    } catch (err) {
      console.error("respondToProjectRequest error:", err);
      handleAuth0Error(err);
    }
  }

  async function sendProjectRequest() {
    if (!activeChatUser) return;

    const trimmedBudget = requestBudget.trim();
    const trimmedDeadline = requestDeadline.trim();

    if (!trimmedBudget || !trimmedDeadline) {
      alert("Te rog completează bugetul și termenul.");
      return;
    }

    if (!isAuthenticated) {
      alert("Trebuie să fii autentificat ca să trimiți o cerere.");
      return;
    }

    try {
      setIsSendingRequest(true);

      const token = await getAccessTokenSilently();

      const res = await fetch(
        `${API_URL}/api/chats/${activeChatUser.id}/project-requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            budget: trimmedBudget,
            deadline: trimmedDeadline,
            notes: requestNotes.trim() || null,
          }),
        }
      );

      if (!res.ok) {
        console.error("Error sending project request:", await res.text());
        return;
      }

      const data = await res.json();
      const msg = data.message;

      // adăugăm și mesajul în chat local
      setChatMessages((prev) => [...prev, msg]);

      // reset formular
      setRequestBudget("");
      setRequestDeadline("");
      setRequestNotes("");
    } catch (err) {
      console.error("sendProjectRequest error:", err);
      handleAuth0Error(err);
    } finally {
      setIsSendingRequest(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      setMe(null);
      return;
    }

    let cancelled = false;

    async function loadMe() {
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(`${API_URL}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          console.error("Error loading /api/me:", await res.text());
          return;
        }
        const data = await res.json();
        if (!cancelled) setMe(data);
      } catch (err) {
        console.error("loadMe error:", err);
        // nu spargem tot dacă /api/me dă eroare
      }
    }

    loadMe();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, getAccessTokenSilently]);

  // ----- LOAD FOLLOWING -----
  useEffect(() => {
    if (!isAuthenticated) {
      setFollowing([]);
      setLoadingFollowing(false);
      return;
    }

    async function loadFollowing() {
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(`${API_URL}/api/following`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setFollowing(await res.json());
      } catch (err) {
        console.error("loadFollowing error:", err);
        handleAuth0Error(err);
      }
    }

    loadFollowing();

    const interval = setInterval(() => {
      loadFollowing();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAuthenticated, getAccessTokenSilently]);

    // ----- LOAD CHAT USERS (cei cu care am conversații) -----
  useEffect(() => {
    if (!isAuthenticated) {
      setChatUsers([]);
      setLoadingChatUsers(false);
      return;
    }

    let cancelled = false;

    async function loadChatUsers() {
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(`${API_URL}/api/chats`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error("Error loading chat users:", await res.text());
          return;
        }

        const data = await res.json();
        if (!cancelled) {
          setChatUsers(data);
        }
      } catch (err) {
        console.error("loadChatUsers error:", err);
        handleAuth0Error(err);
      } finally {
        if (!cancelled) {
          setLoadingChatUsers(false);
        }
      }
    }

    loadChatUsers();

    const interval = setInterval(() => {
      loadChatUsers();
    }, 5000); // refresh la 5s

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAuthenticated, getAccessTokenSilently]);

  // ----- LOAD FEED -----
  useEffect(() => {
    if (!isAuthenticated) {
      setPosts([]);
      setLoadingPosts(false);
      return;
    }

    async function loadFeed() {
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(`${API_URL}/api/feed`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("loadFeed error:", err);
        handleAuth0Error(err);
      }
    }

    // încărcare prima dată
    loadFeed();

    // autorefresh
    const interval = setInterval(() => {
      loadFeed();
    }, 5000); // 5 secunde

    return () => clearInterval(interval);
  }, [isAuthenticated, getAccessTokenSilently]);

  // ----- COMPOSER -----
  function handleComposerChange(e) {
    const { name, value } = e.target;
    setComposer((prev) => ({ ...prev, [name]: value }));
  }

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

      setPosts((prev) => [
        {
          id: newPost.id,
          title: newPost.title,
          content: newPost.content,
          createdAt: newPost.createdAt,
          likeCount: 0,
          likedByMe: false,
          authorName:
            user?.nickname || user?.name || user?.email || "You",
          comments: [],
        },
        ...prev,
      ]);

      setComposer({ title: "", content: "" });
    } catch (err) {
      console.error("handlePost error:", err);
      handleAuth0Error(err);
      alert("Error creating post.");
    }
  }

  // ----- LIKE -----
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
      handleAuth0Error(err);
    }
  }

  // ----- COMMENTS -----
  async function handleAddComment(postId) {
    const text = (commentInputs[postId] || "").trim();
    if (!text) return;

    if (!isAuthenticated) {
      alert("You need to be logged in to comment.");
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${API_URL}/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: text }),
      });

      if (!res.ok) {
        console.error("Error adding comment:", await res.text());
        return;
      }

      const newComment = await res.json();

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments: [...(p.comments || []), newComment] }
            : p
        )
      );

      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("handleAddComment error:", err);
      handleAuth0Error(err);
    }
  }

  // ----- FOLLOW -----
async function toggleFollow(userId) {
  if (!isAuthenticated) {
    alert("You need to be logged in to follow people.");
    return;
  }
  try {
    const token = await getAccessTokenSilently();
    const res = await fetch(`${API_URL}/api/users/${userId}/follow`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error("Error toggling follow:", await res.text());
      return;
    }

    const data = await res.json(); // { following: true/false }

    // updatăm isFollowing pe posturile din feed
    setPosts((prev) =>
      prev.map((p) =>
        p.authorId === userId ? { ...p, isFollowing: data.following } : p
      )
    );

    // reîncarcăm lista Following din backend
    const token2 = await getAccessTokenSilently();
    const res2 = await fetch(`${API_URL}/api/following`, {
      headers: { Authorization: `Bearer ${token2}` },
    });
    if (res2.ok) {
      setFollowing(await res2.json());
    }
  } catch (err) {
    console.error("toggleFollow error:", err);
    handleAuth0Error(err);
  }
}

  // ----- CHAT LOAD -----
  useEffect(() => {
    if (!activeChatUser || !isAuthenticated) {
      setChatMessages([]);
      return;
    }

    let cancelled = false;

    async function loadChat() {
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(
          `${API_URL}/api/chats/${activeChatUser.id}/messages`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          console.error("Error loading chat messages:", await res.text());
          return;
        }

        const data = await res.json();
        if (!cancelled) {
          setChatMessages(data);
        }
      } catch (err) {
        console.error("loadChat error:", err);
        handleAuth0Error(err);
      }
    }

    // prima încărcare imediat când deschizi chatul
    loadChat();

    // 🔁 auto-refresh la fiecare 3 secunde cât timp chatul e deschis
    const interval = setInterval(() => {
      loadChat();
    }, 3000);

    // cleanup când se închide chatul sau se schimbă userul
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeChatUser, isAuthenticated, getAccessTokenSilently]);

  async function sendChatMessage() {
    if (!activeChatUser) return;
    const text = chatInput.trim();
    if (!text) return;

    if (!isAuthenticated) {
      alert("You need to be logged in to chat.");
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(
        `${API_URL}/api/chats/${activeChatUser.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!res.ok) {
        console.error("Error sending message:", await res.text());
        return;
      }

      const msg = await res.json();
      setChatMessages((prev) => [...prev, msg]);
      setChatInput("");
    } catch (err) {
      console.error("sendChatMessage error:", err);
      handleAuth0Error(err);
    }
  }

  return (
    <main className="min-h-screen w-full bg-slate-100 flex justify-center py-8 px-4">
      <div className="w-full max-w-6xl flex flex-col gap-6 lg:flex-row">
        {/* LEFT — Following artists */}
        <aside className="w-full lg:w-1/4 bg-slate-200 border-4 border-slate-900 rounded-3xl shadow-[8px_8px_0_0_#0F172A] p-4">
          <h2 className="text-xl font-bold text-slate-900 mb-3">
            Following
          </h2>

          {loadingFollowing ? (
            <p className="text-sm text-slate-600">Loading...</p>
          ) : following.length === 0 ? (
            <p className="text-sm text-slate-600">
              You're not following anyone yet.
            </p>
          ) : (
            <div className="space-y-2">
              {following.map((artist) => (
                <button
                  key={artist.id}
                  onClick={() =>
                    setActiveChatUser({ id: artist.id, name: artist.name })
                  }
                  className="w-full flex flex-col items-start bg-white border-4 border-slate-900 rounded-2xl px-3 py-2 shadow-[4px_4px_0_0_#0F172A] text-left"
                >
                  <div className="font-semibold text-slate-900">
                    {artist.name}
                  </div>
                  <div className="text-xs text-slate-600">
                    {artist.domain || artist.role || ""}
                  </div>
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* MIDDLE — Composer + Feed */}
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
                  className="px-5 py-2 bg-yellow-300 border-4 border-slate-900 rounded-2xl font-bold shadow-[8px_8px_0_0_#0F172A] disabled:opacity-60"
                >
                  Post
                </button>
              </div>
            </form>
          </div>

          {/* Feed posts — fixed height + scroll */}
          <div className="bg-slate-200 border-4 border-slate-900 rounded-3xl p-4 shadow-[8px_8px_0_0_#0F172A]">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Feed</h2>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
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

                    {post.authorId && !post.authorIsMe && (
                      <button
                        type="button"
                        onClick={() => toggleFollow(post.authorId)}
                        className="ml-1 mb-2 text-[11px] border-2 border-slate-900 rounded-full px-2 py-0.5 bg-white shadow-[2px_2px_0_0_#0F172A]"
                      >
                        {post.isFollowing ? "Unfollow" : "Follow"}
                      </button>
                    )}

                    <p className="text-sm text-slate-800 mb-3 whitespace-pre-wrap">
                      {post.content}
                    </p>

                    {/* post actions */}
                    <div className="flex items-center gap-4 text-sm mb-3">
                      <button
                        type="button"
                        onClick={() => toggleLike(post.id)}
                        className={`border-2 border-slate-900 rounded-full px-3 py-1 shadow-[3px_3px_0_0_#0F172A] ${
                          post.likedByMe
                            ? "bg-slate-900 text-yellow-300"
                            : "bg-yellow-300 text-slate-900"
                        }`}
                      >
                        {post.likedByMe ? "Unlike" : "Like"} (
                        {post.likeCount})
                      </button>

                      <span className="text-xs text-slate-600">
                        {post.comments?.length || 0} comments
                      </span>
                    </div>

                    {/* comments */}
                    <div className="border-t-2 border-slate-200 pt-2 space-y-2">
                      <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                        {post.comments && post.comments.length > 0 ? (
                          post.comments.map((c) => (
                            <div
                              key={c.id}
                              className="text-xs bg-slate-100 border-2 border-slate-900 rounded-xl px-2 py-1"
                            >
                              <span className="font-semibold">
                                {c.authorName}
                              </span>
                              <span className="text-[10px] text-slate-500 ml-1">
                                {c.createdAt
                                  ? new Date(c.createdAt).toLocaleString()
                                  : ""}
                              </span>
                              <p className="text-[11px] text-slate-800">
                                {c.content}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-[11px] text-slate-500">
                            No comments yet.
                          </p>
                        )}
                      </div>

                      {/* add comment */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={commentInputs[post.id] || ""}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }))
                          }
                          className="flex-1 border-2 border-slate-900 rounded-2xl px-2 py-1 text-xs bg-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(post.id)}
                          className="text-xs px-3 py-1 bg-yellow-300 border-2 border-slate-900 rounded-2xl font-bold shadow-[3px_3px_0_0_#0F172A]"
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
        {/* RIGHT — Following / Chats list */}
        <aside className="w-full lg:w-1/4 bg-slate-200 border-4 border-slate-900 rounded-3xl shadow-[8px_8px_0_0_#0F172A] p-4">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Chats</h2>

          <p className="text-sm text-slate-600 mb-2">
            Select someone to chat with:
          </p>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {loadingChatUsers ? (
              <p className="text-sm text-slate-600">Loading chats...</p>
            ) : chatUsers.length === 0 ? (
              <p className="text-sm text-slate-500">
                No chats yet. When someone writes to you, they will appear here.
              </p>
            ) : (
              chatUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() =>
                    setActiveChatUser({ id: u.id, name: u.name })
                  }
                  className={`w-full flex flex-col items-start bg-white border-4 border-slate-900 rounded-2xl px-3 py-2 shadow-[4px_4px_0_0_#0F172A] text-left ${
                    activeChatUser?.id === u.id ? "bg-yellow-200" : ""
                  }`}
                >
                  <div className="font-semibold text-slate-900">
                    {u.name}
                  </div>
                  <div className="text-xs text-slate-600">
                    {u.domain || u.role || ""}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>
        {/* Popup chat plutitor jos-dreapta */}
        {activeChatUser && (
          <div className="hidden lg:block fixed bottom-4 right-4 w-80 bg-slate-200 border-4 border-slate-900 rounded-3xl shadow-[8px_8px_0_0_#0F172A] p-3 z-50">
            {/* Header chat */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-900">
                Chat with {activeChatUser.name}
              </h3>
              <button
                onClick={() => setActiveChatUser(null)}
                className="text-xs border-2 border-slate-900 rounded-full px-2 py-0.5 bg-white"
              >
                X
              </button>
            </div>

            {/* BUTON CERERE PROIECT + form mic (doar pentru BUYER) */}
            {me?.role === "BUYER" && (
              <details className="mb-2 border-2 border-slate-900 rounded-2xl bg-yellow-50 px-2 py-1 text-[11px]">
                <summary className="cursor-pointer font-semibold text-slate-900 select-none">
                  Project request
                </summary>

                <div className="mt-1 space-y-1">
                  <input
                    type="text"
                    placeholder="Budget (ex: 200 EUR)"
                    value={requestBudget}
                    onChange={(e) => setRequestBudget(e.target.value)}
                    className="w-full border-2 border-slate-900 rounded-xl px-2 py-1 text-[11px] bg-white focus:outline-none"
                  />
                  <input
                    type="date"
                    value={requestDeadline}
                    onChange={(e) => setRequestDeadline(e.target.value)}
                    className="w-full border-2 border-slate-900 rounded-xl px-2 py-1 text-[11px] bg-white focus:outline-none"
                  />
                  <textarea
                    placeholder="Short brief / details (optional)"
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    className="w-full border-2 border-slate-900 rounded-xl px-2 py-1 text-[11px] bg-white resize-none focus:outline-none"
                    rows={2}
                  />
                  <button
                    onClick={sendProjectRequest}
                    disabled={isSendingRequest}
                    className="w-full text-[11px] px-2 py-1 bg-yellow-300 border-2 border-slate-900 rounded-2xl font-bold shadow-[2px_2px_0_0_#0F172A] disabled:opacity-60"
                  >
                    {isSendingRequest ? "Sending..." : "Send request"}
                  </button>
                </div>
              </details>
            )}

            {/* Mesaje */}
            <div className="h-40 bg-white border-2 border-slate-900 rounded-2xl mb-2 px-2 py-1 text-xs text-slate-600 overflow-y-auto">
              {loadingChat ? (
                <p>Loading...</p>
              ) : chatMessages.length === 0 ? (
                <p className="text-[11px] text-slate-500">
                  No messages yet. Say hi!
                </p>
              ) : (
                chatMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col mb-1 ${
                      m.fromMe ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-2 py-1 border-2 border-slate-900 shadow-[2px_2px_0_0_#0F172A] ${
                        m.fromMe ? "bg-yellow-300" : "bg-slate-100"
                      }`}
                    >
                      {!m.fromMe && (
                        <div className="text-[9px] font-semibold text-slate-700">
                          {m.senderName}
                        </div>
                      )}
                      <div className="text-[11px] text-slate-800 whitespace-pre-line">
                        {m.text}
                      </div>
                    </div>

                    {/* BUTOANE ACCEPT / DENY doar pentru ARTIST, pe mesajele de cerere, netratate încă */}
                    {me?.role === "ARTIST" &&
                      !m.fromMe &&
                      isProjectRequestMessage(m) &&
                      !handledRequests[m.id] && (
                        <div className="mt-1 flex gap-1">
                          <button
                            onClick={() => respondToProjectRequest("ACCEPTED", m.id)}
                            className="text-[10px] px-2 py-0.5 bg-green-300 border-2 border-slate-900 rounded-full font-semibold shadow-[2px_2px_0_0_#0F172A]"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => respondToProjectRequest("DENIED", m.id)}
                            className="text-[10px] px-2 py-0.5 bg-red-300 border-2 border-slate-900 rounded-full font-semibold shadow-[2px_2px_0_0_#0F172A]"
                          >
                            Deny
                          </button>
                        </div>
                      )}

                    {/* opțional: afișezi decizia sub mesaj, dacă vrei */}
                    {handledRequests[m.id] && (
                      <div className="mt-1 text-[10px] text-slate-700">
                        {handledRequests[m.id] === "ACCEPTED"
                          ? "You accepted this request."
                          : "You denied this request."}
                      </div>
                    )}
                  </div>
                ))

              )}
            </div>

            {/* Input mesaje */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendChatMessage();
                  }
                }}
                className="flex-1 border-2 border-slate-900 rounded-2xl px-2 py-1 text-sm bg-white focus:outline-none"
              />
              <button
                onClick={sendChatMessage}
                className="text-xs px-3 py-1 bg-yellow-300 border-2 border-slate-900 rounded-2xl font-bold shadow-[3px_3px_0_0_#0F172A]"
              >
                Send
              </button>
            </div>
          </div>
        )}        
      </div>
    </main>
  );
}
