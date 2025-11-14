import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";

export default function Signup() {
  const { loginWithRedirect, isLoading } = useAuth0();
  const [form, setForm] = useState({
    name: "",
    email: "",
    pass: "",
    pass2: "",
  });

  function onChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();

    // aici poți păstra validările tale de bază (parole egale, email valid etc.)
    if (!form.email) return;
    if (form.pass !== form.pass2) return;

    // trimitem utilizatorul în Universal Login, cu email precompletat
    await loginWithRedirect({
      authorizationParams: {
        screen_hint: "signup",
        login_hint: form.email,
      },
    });
  }

  return (
    <main className="signup-wrapper">
      <div className="signup-card">
        {/* HEADER INTERN exact cum îl ai deja */}
        <div className="signup-header">
          <span className="signup-header-highlight" />
          <span className="signup-header-text">REGISTER</span>
        </div>

        <div className="signup-top-lines">
          <div className="signup-line-black" />
          <div className="signup-line-yellow" />
        </div>

        <div className="signup-vertical-line" />

        {/* FORMULARUL TĂU */}
        <form className="signup-form" onSubmit={onSubmit}>
          <div>
            <label className="signup-label">Name</label>
            <input
              type="text"
              name="name"
              className="nb-input"
              value={form.name}
              onChange={onChange}
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

          <div>
            <label className="signup-label">Confirm password</label>
            <input
              type="password"
              name="pass2"
              className="nb-input"
              value={form.pass2}
              onChange={onChange}
            />
          </div>

          <div className="signup-btn-container">
            <button
              type="submit"
              className="nav-btn nav-btn-primary signup-btn"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Create account"}
            </button>
          </div>
        </form>

        <p className="signup-login-text">
          Already have an account?{" "}
          <Link to="/login" className="signup-login-link">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
