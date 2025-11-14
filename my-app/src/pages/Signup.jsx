// src/pages/Signup.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Signup() {
  function handleSubmit(e) {
    e.preventDefault();
  }

  return (
    <main className="ui-page-center">
      <div className="ui-card-xl">
        {/* HEADER REGISTER ÎN CARD */}
        <div className="ui-card-header">
          <span className="ui-card-header-highlight" />
          <span className="ui-card-header-title">REGISTER</span>
        </div>

        {/* linii decorative sus */}
        <div className="ui-card-lines">
          <div className="ui-card-line-main" />
          <div className="ui-card-line-accent" />
        </div>

        {/* linia verticală decorativă */}
        <div className="ui-card-divider-vertical" />

        {/* FORMULAR */}
        <form className="ui-form-stack" onSubmit={handleSubmit}>
          <div>
            <label className="ui-label-sm">Name</label>
            <div className="nb-input-wrapper">
              <input
                type="text"
                className="nb-input"
                placeholder="‎ ‎ Your full name"
                required
              />
            </div>
          </div>

          <div>
            <label className="ui-label-sm">Email</label>
            <div className="nb-input-wrapper">
              <input
                type="email"
                className="nb-input"
                placeholder="‎ ‎ you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="ui-label-sm">Password</label>
            <div className="nb-input-wrapper">
              <input
                type="password"
                className="nb-input"
                placeholder="‎ ‎ ••••••••"
                required
              />
            </div>
          </div>

          <div>
            <label className="ui-label-sm">Confirm password</label>
            <div className="nb-input-wrapper">
              <input
                type="password"
                className="nb-input"
                placeholder="‎ ‎ Repeat password"
                required
              />
            </div>
          </div>

          <div className="ui-card-actions">
            <button type="submit" className="nb-btn ui-btn-primary">
              Create account
            </button>
          </div>
        </form>

        <p className="ui-text-muted-xs">
          Already have an account?{" "}
          <Link to="/login" className="ui-link-underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
