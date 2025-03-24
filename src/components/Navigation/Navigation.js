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

  console.log("User name:", user?.name);

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

      <div className="profile-container">
        <div className="dropdown d-flex align-items-center">
          {/* Profile Image */}
          <img
            src={defaultAvatar}
            alt="Profile"
            className="profile-circle"
            id="dropdownMenuButton"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{
              cursor: "pointer",
              width: "50px",
              height: "50px",
              borderRadius: "50%",
            }}
          />

          {/* Dropdown Toggle Icon */}
          <span
            className="ms-2 dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{ cursor: "pointer", fontSize: "20px" }}
          ></span>

          {/* Dropdown Menu */}
          <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <li>
              <p className="dropdown-user">Hi, {user?.name}!</p>
            </li>

            <li>
              <button className="logout-btn" onClick={logout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </ul>
  );
}
