import React from "react";
import "./Navigation.css";
import { Link } from "react-router-dom";

function Navigation() {
  const handleScroll = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
    </ul>
  );
}

export default Navigation;
