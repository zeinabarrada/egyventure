import React from "react";
import Navigation from "../Navigation/Navigation"; // Import Navigation
import "./Header.css";
import { useAuth } from "../Registration/AuthContext";
function Header() {
  const { isAuthenticated, logout, user } = useAuth();
  if (!isAuthenticated) {
    return null;
  }
  return <Navigation />;
}

export default Header;
