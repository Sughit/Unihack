// src/pages/Signup.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Signup() {
  function handleSubmit(e) {
    e.preventDefault();
  }

  return (
    <main className="signup-wrapper">
      <div className="signup-card">
        
        {/* HEADER REGISTER ÎN CARD */}
        <div className="signup-header">
          <span className="signup-header-highlight" />
          <span className="signup-header-text">REGISTER</span>
        </div>

        {/* linii decorative */}
        <div className="signup-top-lines">
          <div className="signup-line-black"></div>
          <div className="signup-line-yellow"></div>
        </div>

        {/* linie verticală */}
        <div className="signup-vertical-line"></div>

        {/* FORMULAR */}
        <form className="signup-form" onSubmit={handleSubmit}>
          <div>
            <label className="signup-label">Name</label>
            <div className="nb-input-wrapper">
              <input type="text" className="nb-input" placeholder="Your full name" />
            </div>
          </div>

          <div>
            <label className="signup-label">Email</label>
            <div className="nb-input-wrapper">
              <input type="email" className="nb-input" placeholder="you@example.com" />
            </div>
          </div>

          <div>
            <label className="signup-label">Password</label>
            <div className="nb-input-wrapper">
              <input type="password" className="nb-input" placeholder="••••••••" />
            </div>
          </div>

          <div>
            <label className="signup-label">Confirm password</label>
            <div className="nb-input-wrapper">
              <input type="password" className="nb-input" placeholder="Repeat password" />
            </div>
          </div>

          <div className="signup-btn-container">
            <button type="submit" className="nb-btn signup-btn">Create account</button>
          </div>
        </form>

        <p className="signup-login-text">
          Already have an account?{" "}
          <Link to="/login" className="signup-login-link">Log in</Link>
        </p>

      </div>
    </main>
  );
}
