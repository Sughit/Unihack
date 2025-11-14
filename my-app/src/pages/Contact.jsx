import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    type: "company",
    subject: "",
    message: "",
  });

  function onChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function onSubmit(e) {
    e.preventDefault();
    // aici poți integra un API (email, backend, etc.)
    console.log("CONTACT FORM:", form);
    alert("This is a demo contact form. No message was actually sent.");
  }

  return (
    <main className="signup-wrapper">
      <div className="signup-card">
        {/* HEADER CONTACT – pastilă ca la signup-header */}
        <div className="signup-header">
          <span className="signup-header-highlight" />
          <span className="signup-header-text">CONTACT</span>
        </div>

        {/* linii decorative de sus */}
        <div className="signup-top-lines">
          <div className="signup-line-black" />
          <div className="signup-line-yellow" />
        </div>

        {/* linie verticală decorativă, puțin mai scurtă */}
        <div className="signup-vertical-line" />

        {/* INTRO */}
        <p className="text-xs text-slate-700 mb-5">
          Have a question about Creon, partnerships or demo access?  
          Send us a message and we&apos;ll get back to you.
        </p>

        {/* FORMULAR */}
        <form className="signup-form" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="signup-label">Full name</label>
              <input
                type="text"
                name="name"
                className="nb-input"
                value={form.name}
                onChange={onChange}
                placeholder="Alex Ionescu"
              />
            </div>

            <div>
              <label className="signup-label">Email</label>
              <input
                type="email"
                name="email"
                className="nb-input"
                value={form.email}
                onChange={onChange}
                placeholder="you@company.com"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="signup-label">I am</label>
              <select
                name="type"
                className="nb-input"
                value={form.type}
                onChange={onChange}
              >
                <option value="company">A company / team</option>
                <option value="artist">An artist / creative</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="signup-label">Subject</label>
              <input
                type="text"
                name="subject"
                className="nb-input"
                value={form.subject}
                onChange={onChange}
                placeholder="Partnership, demo, support..."
              />
            </div>
          </div>

          <div>
            <label className="signup-label">Message</label>
            <textarea
              name="message"
              rows="4"
              className="nb-input"
              value={form.message}
              onChange={onChange}
              placeholder="Tell us briefly what you need and how we can help."
            />
          </div>

          <div className="signup-btn-container">
            <button type="submit" className="nb-btn signup-btn">
              Send message
            </button>
          </div>
        </form>

        {/* extra info */}
        <p className="signup-login-text">
          Prefer email? Reach us at{" "}
          <span className="font-semibold">contact@creon.app</span> (demo).
        </p>
      </div>
    </main>
  );
}
