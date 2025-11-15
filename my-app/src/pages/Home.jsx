// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [messages, setMessages] = useState([
    {
      from: "assistant",
      text: "Hi! I’m your Creon Assistant. I can help you find artists, review profiles, or draft project briefs. Ask me anything.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  async function handleSend(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMessage = { from: "user", text: trimmed };
    setInput("");
    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);

    try {
      const res = await fetch("http://localhost:4000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json();
      console.log("API /api/chat:", res.status, data);

      if (!res.ok || !data.reply) {
        throw new Error(data.error || data.details || "No reply from Gemini");
      }

      const replyText = data.reply;

      setMessages((prev) => [
        ...prev,
        { from: "assistant", text: replyText },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          from: "assistant",
          text: "There was an error talking to the assistant. Please try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="bg-slate-100 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-12">
        {/* GRID: 3 coloane, cardurile ocupă 2, chat-ul 1 */}
        <section className="grid gap-8 lg:grid-cols-3">
          {/* ======================= */}
          {/*   STÂNGA – 2 COL (CARDURI) */}
          {/* ======================= */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* CARD PRINCIPAL (INTRO) */}
            <div className="relative rounded-[2.75rem] border-[4px] border-slate-900 bg-white px-10 pt-10 pb-10 shadow-[8px_8px_0_0_rgba(15,23,42,1)] overflow-hidden">
              {/* pill sus */}
              <div className="relative mx-auto mb-6 flex w-max items-center justify-center px-10 py-2 rounded-full border-[4px] border-slate-900 bg-white shadow-[6px_6px_0_0_rgba(15,23,42,1)]">
                <span className="absolute inset-x-3 bottom-1 h-2 rounded-full bg-amber-300 -z-10" />
                <span className="text-xs md:text-sm font-black tracking-[0.35em] uppercase text-slate-900">
                  Intro
                </span>
              </div>

              {/* linii sus */}
              <div className="mb-6 mt-2">
                <div className="h-1.5 w-32 rounded-full bg-slate-900" />
                <div className="mt-1 h-1 w-40 rounded-full bg-amber-300" />
              </div>

              {/* text principal */}
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-3 pr-5">
                Welcome to{" "}
                <span className="underline decoration-amber-300 decoration-[6px]">
                  Creon
                </span>
                , where creators and companies truly meet.
              </h1>

              <p className="text-sm md:text-base text-slate-700 max-w-xl mb-6">
                A modern platform built to connect businesses with artists.
              </p>

              {/* CTA */}
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/signup" className="nav-btn nav-btn-primary">
                  Get started
                </Link>
                <Link to="/search" className="nav-btn nav-btn-outline">
                  Search
                </Link>
              </div>

              {/* linie dreapta */}
              <span className="pointer-events-none absolute top-24 right-16 bottom-16 border-l-4 border-dashed border-amber-300" />
            </div>

            {/* CARD SECUNDAR */}
            <div className="relative rounded-[2.5rem] border-[4px] border-slate-900 bg-white px-8 pt-8 pb-7 shadow-[8px_8px_0_0_rgba(15,23,42,1)] flex flex-col justify-between">
              <p className="text-sm text-slate-700 mb-4">
                Creon is a marketplace that helps businesses find real artists —
                not AI generators — for branding, illustrations, video, UI
                design and more.
              </p>

              <div className="grid md:grid-cols-3 gap-3 text-xs">
                <div className="rounded-2xl border-[3px] border-slate-900 bg-amber-200 px-3 py-2 shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                  <p className="text-sm md:text-base font-black">
                    Browse real talent
                  </p>
                </div>
                <div className="rounded-2xl border-[3px] border-slate-900 bg-sky-200 px-3 py-2 shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                  <p className="text-sm md:text-base font-black">
                    Chat and request quotes
                  </p>
                </div>
                <div className="rounded-2xl border-[3px] border-slate-900 bg-lime-200 px-3 py-2 shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                  <p className="text-sm md:text-base font-black">
                    Hire professionals safely
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ======================= */}
          {/*   DREAPTA – CHAT (1 COL) */}
          {/* ======================= */}
          <aside className="lg:col-span-1 flex">
            <div className="relative flex flex-col w-full rounded-[2.75rem] border-[4px] border-slate-900 bg-pink-50 px-6 pt-6 pb-4 shadow-[8px_8px_0_0_rgba(15,23,42,1)]">
              {/* header chat */}
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full border-[3px] border-slate-900 bg-pink-200" />
                  <span className="text-sm font-black uppercase tracking-wide">
                    Creon Assistant
                  </span>
                </div>

                <span className="text-[10px] px-2 py-1 rounded-full border-[2px] border-slate-900 bg-white font-semibold">
                  {isSending ? "Typing…" : "Online"}
                </span>
              </div>

              {/* mesaje */}
              <div className="flex-1 mb-3 rounded-2xl border-[3px] border-slate-900 bg-white px-3 py-2 overflow-y-auto text-xs text-slate-700 space-y-2">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={m.from === "user" ? "text-right" : "text-left"}
                  >
                    <span
                      className={
                        "inline-block px-2 py-1 rounded-xl border-[2px] border-slate-900 shadow-[3px_3px_0_0_rgba(15,23,42,1)] " +
                        (m.from === "user"
                          ? "bg-amber-200"
                          : "bg-slate-100")
                      }
                    >
                      {m.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* input jos */}
              <form onSubmit={handleSend} className="flex gap-2 items-center">
                <div className="flex-1 nb-input-wrapper">
                  <input
                    className="nb-input"
                    placeholder={
                      isSending ? "Sending..." : "Type your message..."
                    }
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isSending}
                  />
                </div>
                <button
                  type="submit"
                  className="nb-btn ui-btn-primary"
                  disabled={isSending}
                >
                  {isSending ? "..." : "Send"}
                </button>
              </form>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

export default Home;
  