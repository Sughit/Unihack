import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="nav-shell">
      <div className="nav-inner">

        {/* STÂNGA – LOGO / BRAND */}
        <Link to="/" className="nav-brand">
          <span className="nav-brand-highlight" />
          <span className="nav-brand-circle">C</span>
          <span className="nav-brand-text">Creon</span>
        </Link>

        {/* CENTRU – LINK-URI */}
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

        {/* DREAPTA – SIGNUP / LOGIN */}
        <div className="nav-actions">
          <Link to="/signup" className="nav-btn nav-btn-primary">
            Sign Up
          </Link>
          <Link to="/login" className="nav-btn nav-btn-outline">
            Login
          </Link>
        </div>

      </div>
    </header>
  );
}
