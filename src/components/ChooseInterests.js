import { useState } from "react";
import "./ChooseInterests.css";
import axios from "axios";
import { useAuth } from "../components/Registration/AuthContext";
import { useNavigate } from "react-router-dom";
import interestsList from "./Registration/interestsList";

export default function ChooseInterests() {
  const { user } = useAuth(); // Get user from AuthContext
  const userId = user?.id;
  const navigate = useNavigate();

  const [selectedInterests, setSelectedInterests] = useState([]);
  const [activeCategory, setActiveCategory] = useState(
    interestsList[0].category
  );

  const toggleInterest = (interest) => {
    setSelectedInterests(
      (prev) =>
        prev.includes(interest)
          ? prev.filter((item) => item !== interest) // Deselect
          : [...prev, interest] // Select
    );
  };
  const handleSubmit = async () => {
    try {
      const interestsString = selectedInterests.join(",");
      const response = await axios.post(
        "http://127.0.0.1:8000/post_interests/",
        {
          user_id: userId,
          interests: interestsString,
        }
      );

      if (response.status === 200) {
        navigate("/homepage");
      } else {
        alert("Failed to submit interests.");
      }
    } catch (error) {
      console.error("Error submitting interests:", error);
      alert("An error occurred. Please try again.");
    }
  };
  // Find the active category object
  const activeCategoryObj = interestsList.find(
    (cat) => cat.category === activeCategory
  );

  return (
    <div className="choose-interests-main-container">
      <div className="heading-container">
        <h2>Tell us what you're interested in</h2>
        <p>Select all that apply</p>
      </div>

      <div
        className="category-tabs"
        style={{
          display: "flex",
          gap: "1rem",
          margin: "0 auto 2.5rem auto",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {interestsList.map((cat) => (
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
      <div
        className="interests-category-row"
        style={{
          justifyContent: "center",
          marginBottom: "2.5rem",
          flexWrap: "wrap",
        }}
      >
        {activeCategoryObj.interests.map((interest) => (
          <button
            key={interest}
            className={`interest-btn${
              selectedInterests.includes(interest) ? " selected" : ""
            }`}
            onClick={() => toggleInterest(interest)}
          >
            {interest}
          </button>
        ))}
      </div>
      <div className="submit-container">
        <button className="submit-btn" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}
