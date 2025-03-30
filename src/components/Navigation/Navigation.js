import "./Navigation.css";
import { Link } from "react-router-dom";
import { useAuth } from "../Registration/AuthContext";
import defaultAvatar from "./defaultAvatar.jpg";
import { useState, useEffect, useRef } from "react";

export default function Navigation() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleScroll = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="navigation-container">
      <div className="nav-logo">EGYVENTURE</div>

      <ul className="nav-links">
        <li className="nav-item">
          <Link
            to="/homepage"
            className="nav-link"
            onClick={() => handleScroll("home")}
          >
            Home
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/"
            className="nav-link"
            onClick={() => handleScroll("destinations")}
          >
            Destinations
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/safetytips" className="nav-link">
            Safety Tips
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/"
            className="nav-link"
            onClick={() => handleScroll("about")}
          >
            About Us
          </Link>
        </li>
      </ul>

      <div className="profile-container" ref={dropdownRef}>
        <div className="profile-dropdown">
          <div
            className="profile-toggle"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <img src={defaultAvatar} alt="Profile" className="profile-avatar" />
            <span
              className={`profile-caret ${isDropdownOpen ? "open" : ""}`}
            ></span>
          </div>

          <div className={`dropdown-menu ${isDropdownOpen ? "show" : ""}`}>
            <div className="dropdown-header">
              <p className="dropdown-user">Hi, {user?.name}!</p>
            </div>
            <button
              className="dropdown-item"
              onClick={() => {
                logout();
                setIsDropdownOpen(false);
              }}
            >
              Likes
            </button>
            <button
              className="dropdown-item"
              onClick={() => {
                logout();
                setIsDropdownOpen(false);
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
