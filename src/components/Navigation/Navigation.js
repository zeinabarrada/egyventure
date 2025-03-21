import React from "react";
import "./Navigation.css";
import { Link } from "react-router-dom";
import { useAuth } from "../Registration/AuthContext";
import defaultAvatar from "./defaultAvatar.jpg";
import { useState, useEffect } from "react";

export default function Navigation() {
  const { isAuthenticated, logout, user } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    console.log("Dropdown state:", isDropdownOpen);
  }, [isDropdownOpen]);
  const handleScroll = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  const toggleDropdown = (e) => {
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <ul className="navigation">
      <li href="#home" onClick={() => handleScroll("home")}>
        <Link to="/">Home</Link>
      </li>
      <li href="#destinations" onClick={() => handleScroll("destinations")}>
        Destinations
      </li>
      <li href="#safetytips" onClick={() => handleScroll("safety")}>
        Safety Tips
      </li>
      <li href="#aboutus" onClick={() => handleScroll("about")}>
        About Us
      </li>
      {isAuthenticated && (
        <div className="profile-container">
          <img
            src={defaultAvatar}
            alt="Profile"
            className="profile-circle"
            onClick={toggleDropdown}
          />

          {isDropdownOpen && (
            <div className="dropdown-menu">
              <p className="dropdown-user">Hi, {user.firstName}!</p>
              <hr />
              <p className="dropdown-title">Likes</p>
              <button className="logout-btn" onClick={logout}>
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </ul>
  );
}
