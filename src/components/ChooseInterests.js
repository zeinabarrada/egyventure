import { useState } from "react";
import "./ChooseInterests.css";
import axios from "axios";
import { useAuth } from "../components/Registration/AuthContext";
import { useNavigate } from "react-router-dom";
import interestsList from "./Registration/interestsList";

export default function ChooseInterests() {
  const { user } = useAuth(); // Get user from AuthContext
  const userId = user?.id;
  console.log(userId);
  const navigate = useNavigate();

  const [selectedInterests, setSelectedInterests] = useState([]);

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
      console.log(interestsString);
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
  return (
    <div>
      <div className="heading-container">
        <h2>Tell us what you're interested in</h2>
        <p>Select all that apply</p>
      </div>

      <div className="interests-container">
        {interestsList.map((interest) => (
          <button
            key={interest}
            className={selectedInterests.includes(interest) ? "selected" : ""}
            onClick={() => toggleInterest(interest)}
          >
            {interest}
          </button>
        ))}
        <div className="submit-container">
          <button className="submit-btn" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
