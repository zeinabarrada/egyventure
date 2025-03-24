import React from "react";
import Navigation from "../Navigation/Navigation"; // Import Navigation
import "./Header.css";

function Header() {
  return (
    <header className="main-header">
      <div className="logo">EGYVENTURE</div>
      <Navigation /> {/* Add Navigation inside Header */}
    </header>
  );
}

export default Header;
