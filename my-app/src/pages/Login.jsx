import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import React, { usseState, useEffect } from "react";

export default function Login() {
 useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const { loginWithRedirect, isLoading } = useAuth0();
  const [form, setForm] = useState({ email: "", pass: "" });

  function onChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();

    if (!form.email) return;

    await loginWithRedirect({
      authorizationParams: {
        login_hint: form.email,
      },
    });
  }

  return (
    <main className="signup-wrapper">
      <div className="signup-card">
        <div className="signup-header">
          <span className="signup-header-highlight" />
          <span className="signup-header-text">LOGIN</span>
        </div>

        <div className="signup-top-lines">
          <div className="signup-line-black" />
          <div className="signup-line-yellow" />
        </div>

        <div className="signup-vertical-line" />

        <form className="signup-form" onSubmit={onSubmit}>
          <div>
            <label className="signup-label">Email</label>
            <input
              type="email"
              name="email"
              className="nb-input"
              value={form.email}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="signup-label">Password</label>
            <input
              type="password"
              name="pass"
              className="nb-input"
              value={form.pass}
              onChange={onChange}
            />
          </div>

          <div className="signup-btn-container">
            <button
              type="submit"
              className="nav-btn nav-btn-primary signup-btn"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Login"}
            </button>
          </div>
        </form>

        <p className="signup-login-text">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="signup-login-link">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
