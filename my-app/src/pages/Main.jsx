// src/pages/Main.jsx
import React, { useState, useEffect } from "react";

const dummyArtists = [
  "RAPPERUL#tău",
  "Lo-Fi Beats",
  "IndieKid99",
  "TrapLord",
  "SynthWave",
  "JazzHead",
  "DJ Sample",
];

const dummyPosts = [
  {
    id: 1,
    author: "RAPPERUL#tău",
    title: "Noul meu single",
    body: "Am urcat un snippet din viitorul album. Feedback?",
  },
  {
    id: 2,
    author: "IndieKid99",
    title: "Concert mic la subsol",
    body: "Sâmbătă, la 20:00, fac un gig acustic în oraș.",
  },
];

const dummyChats = [
  { id: 1, name: "RAPPERUL#tău" },
  { id: 2, name: "IndieKid99" },
  { id: 3, name: "SynthWave" },
];

const API_URL = import.meta.env.VITE_API_URL;

export default function Main() {
  const [activeChat, setActiveChat] = useState(null);
  const [composer, setComposer] = useState({ title: "", content: "" });

  // stare pentru chat
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);

  function handlePost(e) {
    e.preventDefault();
    if (!composer.title.trim() && !composer.content.trim()) return;
    // aici vei pune logica reală de post
    alert("Post creat (demo).");
    setComposer({ title: "", content: "" });
  }

  function handleSendMessage(e) {
    e.preventDefault();
    if (!activeChat) return;
    if (!chatInput.trim()) return;

    const payload = {
      chatName: activeChat.name,
      text: chatInput,
    };

    // trimitem în backend
    fetch(`${API_URL}/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((msg) => {
        // adăugăm mesajul nou în listă
        setMessages((prev) => [...prev, msg]);
        setChatInput("");
      })
      .catch((err) => {
        console.error(err);
        alert("Eroare la trimiterea mesajului.");
      });
  }

  // când se schimbă activeChat, încărcăm mesajele din DB
  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);

    fetch(
      `${API_URL}/api/messages?chatName=${encodeURIComponent(activeChat.name)}`
    )
      .then((r) => r.json())
      .then((data) => {
        setMessages(data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoadingMessages(false));
  }, [activeChat]);

  return (
    <main className="ui-main-shell">
      <div className="ui-main-grid">
        {/* STÂNGA – artiști urmăriți */}
        <aside className="ui-col-left">
          <div className="ui-panel">
            <h2 className="ui-panel-title">Following</h2>
            <div className="ui-list-vertical mt-4">
              {dummyArtists.map((name) => (
                <button key={name} className="ui-list-item">
                  {name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* MIJLOC – composer + feed */}
        <section className="ui-col-center">
          {/* Composer post */}
          <div className="ui-panel ui-panel-soft mb-6">
            <h2 className="ui-panel-title mb-2">Create a post</h2>
            <form onSubmit={handlePost} className="space-y-3">
              {/* TITLE cu stil neo-brutalist */}
              <div>
                <div className="nb-input-wrapper">
                  <input
                    type="text"
                    className="nb-input"
                    placeholder="Title"
                    value={composer.title}
                    onChange={(e) =>
                      setComposer((c) => ({ ...c, title: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* CONTENT */}
              <div>
                <textarea
                  className="ui-textarea"
                  rows={3}
                  placeholder="What's on your mind?"
                  value={composer.content}
                  onChange={(e) =>
                    setComposer((c) => ({ ...c, content: e.target.value }))
                  }
                />
              </div>

              <div className="flex justify-end">
                <button type="submit" className="nb-btn ui-btn-primary">
                  Post
                </button>
              </div>
            </form>
          </div>

          {/* Feed postări */}
          <div className="space-y-4">
            {dummyPosts.map((post) => (
              <article key={post.id} className="ui-post-card">
                <h3 className="ui-post-title">{post.title}</h3>
                <p className="ui-post-meta">by {post.author}</p>
                <p className="ui-post-body">{post.body}</p>

                {/* acțiuni post */}
                <div className="ui-post-actions">
                  <button className="ui-post-action">Like</button>
                  <button className="ui-post-action">Comments</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* DREAPTA – lista de chat-uri */}
        <aside className="ui-col-right">
          <div className="ui-panel">
            <h2 className="ui-panel-title">Chats</h2>
            <div className="ui-list-vertical mt-4">
              {dummyChats.map((chat) => (
                <button
                  key={chat.id}
                  className="ui-list-item"
                  onClick={() => setActiveChat(chat)}
                >
                  {chat.name}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* POPUP CHAT DREAPTA JOS */}
      {activeChat && (
        <div className="ui-chat-popup">
          <header className="ui-chat-header">
            <span>{activeChat.name}</span>
            <button
              className="ui-chat-close"
              onClick={() => setActiveChat(null)}
            >
              ✕
            </button>
          </header>

          <div className="ui-chat-messages">
            {loadingMessages ? (
              <p className="text-xs text-slate-600">Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="text-xs text-slate-600">
                No messages yet. Say hi!
              </p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="ui-chat-message">
                  <p className="text-sm">{m.text}</p>
                  <p className="text-[10px] text-slate-500">
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendMessage} className="ui-chat-input-row">
            <input
              className="ui-chat-input"
              placeholder={`Message ${activeChat.name}...`}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button type="submit" className="nb-btn ui-btn-primary">
              Send
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
