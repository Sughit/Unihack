import { Link, NavLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import LoginButton from "../utils/loginButton";
import SignupButton from "../utils/signupButton";
import LogoutButton from "../utils/logoutButton";

export default function Navbar() {
  const { user, isAuthenticated } = useAuth0();

  return (
    <header className="nav-shell">
      <div className="nav-inner">

        {/* LOGO */}
        <Link to="/" className="nav-brand">
          <span className="nav-brand-highlight" />
          <span className="nav-brand-circle">C</span>
          <span className="nav-brand-text">Creon</span>
        </Link>

        {/* LINKS */}
        <nav className="nav-links">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/search"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            Search
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            Contact
          </NavLink>
        </nav>

        {/* RIGHT SIDE */}
        <div className="nav-actions">

          {/* Dacă NU e logat */}
          {!isAuthenticated && (
            <>
              <SignupButton />
              <LoginButton />
            </>
          )}

          {/* Dacă ESTE logat */}
          {isAuthenticated && (
            <div className="nav-user-box">

              <img
                src={user?.picture}
                alt="avatar"
                className="nav-avatar"
              />

              <span className="nav-email">
                {user?.email}
              </span>

              <LogoutButton />
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
