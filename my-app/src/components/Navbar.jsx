import { Link, NavLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import LoginButton from "../utils/loginButton";
import SignupButton from "../utils/signupButton";
import LogoutButton from "../utils/logoutButton";

export default function Navbar() {
  const { isAuthenticated } = useAuth0();

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
            to="/discover"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            Discover
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
          {!isAuthenticated && (
            <>
              <SignupButton />
              <LoginButton />
            </>
          )}

          {isAuthenticated && (
            <>
              <Link to="/profile" className="nav-btn nav-btn-primary">
                Profile
              </Link>
              <LogoutButton />
            </>
          )}
        </div>

      </div>
    </header>
  );
}
