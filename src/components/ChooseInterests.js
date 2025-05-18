import { useState } from "react";
import "./ChooseInterests.css";
import axios from "axios";
import { useAuth } from "../components/Registration/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ChooseInterests() {
  const { user } = useAuth(); // Get user from AuthContext
  const userId = user?.id;
  console.log(userId);
  const navigate = useNavigate();
  const interestsList = [
    "adrenaline & extreme",
    "atv & off-road",
    "balloon rides",
    "ski & snow",

    "kayaking & canoeing",
    "safaris",
    "hiking & camping",

    "ancient ruins",

    "monuments & statues",
    "museums",
    "points of interest & landmarks",
    "sacred & religious sites",
    "sights & landmarks",

    "historic sites",
    "historical & heritage",
    "history museums",
    "cemeteries",
    "churches & cathedrals",

    "art galleries",
    "art museums",
    "cultural",
    "libraries",

    "nightlife",
    "spas & wellness",

    "farmers markets",
    "flea & street markets",
    "gift & specialty shops",
    "antique stores",
    "shopping",

    "nature & parks",
    "nature & wildlife",
    "zoos & aquariums",
    "mountains",
    "deserts",

    "archaeology",

    "submarine",
    "surfing",
    "swim with dolphins",
    "theme parks",
    "scuba & snorkeling",
    "shark diving",
    "water & amusement parks",

    "water sports",
    "waterskiing & jet skiing",
    "beaches",
    "boat  & water sports",
    "bodies of water",
    "windsurfing & kitesurfing",
  ];

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
