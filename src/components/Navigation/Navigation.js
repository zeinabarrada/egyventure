import "./Navigation.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Registration/AuthContext";
import defaultAvatar from "./defaultAvatar.jpg";
import { useState, useEffect, useRef } from "react";
import LikesList from "../LikesPage";
import axios from "axios";
export default function Navigation() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isCitiesDropdownOpen, setIsCitiesDropdownOpen] = useState(false);
  const [cities, setCities] = useState([]);
  const citiesDropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleScroll = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/filter_city/");
        if (response.data.status === "success") {
          setCities(response.data.cities);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };
    fetchCities();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (
        citiesDropdownRef.current &&
        !citiesDropdownRef.current.contains(event.target)
      ) {
        setIsCitiesDropdownOpen(false);
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
        <li
          className="nav-item"
          ref={citiesDropdownRef}
          onMouseEnter={() => setIsCitiesDropdownOpen(true)}
          onMouseLeave={() => setIsCitiesDropdownOpen(false)}
        >
          <div className="nav-link-container">
            <Link
              to="/homepage"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                handleScroll("destinations");
              }}
            >
              Destinations
            </Link>
            {isCitiesDropdownOpen && cities.length > 0 && (
              <div className="cities-dropdown">
                {cities.map((city) => (
                  <Link
                    key={city}
                    to={`/attractions?city=${encodeURIComponent(city)}`}
                    className="city-dropdown-item"
                    onClick={() => setIsCitiesDropdownOpen(false)}
                  >
                    {city}
                  </Link>
                ))}
              </div>
            )}
          </div>
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
                navigate("/likes");
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
