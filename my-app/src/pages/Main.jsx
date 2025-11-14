// src/pages/Main.jsx
import React, { useState } from "react";

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

export default function Main() {
  const [activeChat, setActiveChat] = useState(null);
  const [composer, setComposer] = useState({ title: "", content: "" });

  function handlePost(e) {
    e.preventDefault();
    if (!composer.title.trim() && !composer.content.trim()) return;
    // aici vei pune logica reală de post
    alert("Post creat (demo).");
    setComposer({ title: "", content: "" });
  }

  function handleSendMessage(e) {
    e.preventDefault();
    // aici vei pune trimiterea reală
    alert("Mesaj trimis (demo).");
  }

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
            <p className="text-xs text-slate-600">
              (aici vor apărea mesajele cu {activeChat.name})
            </p>
          </div>

          <form onSubmit={handleSendMessage} className="ui-chat-input-row">
            <input
              className="ui-chat-input"
              placeholder="Send a message..."
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