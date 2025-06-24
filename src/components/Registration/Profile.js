import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import "./Registeration.css";
import categorizedInterests from "./interestsList";
import defaultAvatar from "../Navigation/defaultAvatar.jpg";

const Profile = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const [account, setAccount] = useState(null);
  const [interests, setInterests] = useState([]);
  const [activeCategory, setActiveCategory] = useState(
    categorizedInterests[0].category
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAccount = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://127.0.0.1:8000/account/", {
          params: { user_id: userId },
        });
        setAccount(response.data);
        let userInterests = response.data.interests;
        if (Array.isArray(userInterests)) {
          setInterests(userInterests);
        } else if (
          typeof userInterests === "string" &&
          userInterests.length > 0
        ) {
          setInterests(
            userInterests
              .split(",")
              .map((i) => i.trim())
              .filter(Boolean)
          );
        } else {
          setInterests([]);
        }
      } catch (err) {
        setError("Failed to load account details");
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchAccount();
  }, [userId]);

  const handleInterestToggle = (interest) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      await axios.post("http://127.0.0.1:8000/update_interests/", {
        user_id: userId,
        interests: interests.join(","),
      });
      setSuccess("Interests updated successfully!");
    } catch (err) {
      setError("Failed to update interests");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="profile-section-modern">Loading...</div>;
  if (!account)
    return <div className="profile-section-modern">No account found.</div>;

  const fullName =
    (account.first_name || "") +
      (account.last_name ? " " + account.last_name : "") ||
    account.username ||
    user?.name ||
    "User";

  // Find the active category object
  const activeCategoryObj = categorizedInterests.find(
    (cat) => cat.category === activeCategory
  );

  return (
    <section className="profile-section-modern">
      <div className="profile-header-modern">
        <img
          src={defaultAvatar}
          alt="Profile Avatar"
          className="profile-avatar-modern"
        />
        <div className="profile-info-modern">
          <span className="profile-name">{fullName}</span>
          <span className="profile-email">{account.email}</span>
        </div>
      </div>
      <div className="profile-interests-modern">
        <div
          className="category-tabs"
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
          }}
        >
          {categorizedInterests.map((cat) => (
            <button
              key={cat.category}
              className={`category-tab-btn${
                activeCategory === cat.category ? " active" : ""
              }`}
              style={{
                background:
                  activeCategory === cat.category ? "#1a365d" : "#e9ecef",
                color: activeCategory === cat.category ? "#fff" : "#1a365d",
                border: "none",
                borderRadius: "999px",
                padding: "0.6rem 1.5rem",
                fontWeight: 600,
                fontSize: "1rem",
                cursor: "pointer",
                transition: "background 0.2s, color 0.2s",
              }}
              onClick={() => setActiveCategory(cat.category)}
            >
              {cat.category}
            </button>
          ))}
        </div>
        <h3 style={{ marginBottom: "1.2rem", color: "#1a365d" }}>
          Select Interests
        </h3>
        <div className="interests-list-modern">
          {activeCategoryObj.interests.map((interest) => (
            <span
              key={interest}
              className={`interest-pill${
                interests.includes(interest) ? " selected" : ""
              }`}
              onClick={() => handleInterestToggle(interest)}
              style={{ userSelect: "none" }}
            >
              {interest}
            </span>
          ))}
        </div>
      </div>
      <button
        className="save-btn-modern"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Interests"}
      </button>
      {success && <div className="success-msg">{success}</div>}
      {error && <div className="error-msg">{error}</div>}
    </section>
  );
};

export default Profile;
