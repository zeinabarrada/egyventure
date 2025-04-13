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
    "boat rentals",
    "deserts",
    "churches & cathedrals",
    "farmers markets",
    "parasailing & paragliding",
    "windsurfing & kitesurfing",
    "equestrian trails",
    "historic walking areas",
    "self-guided  & rentals",
    "arab baths",
    "boat  & water sports",
    "swim with dolphins",
    "historic sites",
    "neighborhoods",
    "classes & workshops",
    "outdoor",
    "water parks",
    "hiking & camping",
    "bed and breakfast",
    "specialty museums",
    "water & amusement parks",
    "mountains",
    "ski & snow",
    "kayaking & canoeing",
    "ancient ruins",
    "horse-drawn carriage",
    "sacred & religious sites",
    "dance clubs & discos",
    "multi-day",
    "piers & boardwalks",
    "nightlife",

    "gift & specialty shops",
    "cultural",
    "history museums",
    "thermal spas",
    "points of interest & landmarks",
    "water sports",

    "food & drink",
    "aquariums",
    "yoga & pilates",
    "spas",
    "adrenaline & extreme",
    "game & entertainment centers",
    "room escape games",
    "reefs",
    "cemeteries",
    "factory",
    "submarine",
    "scuba & snorkeling",

    "shopping malls",
    "stand-up paddleboarding",
    "educational sites",
    "beaches",
    "sights & landmarks",

    "hammams & turkish baths",
    "monuments & statues",
    "zoos & aquariums",
    "bodies of water",

    "sports complexes",
    "club & pub",
    "casinos & gambling",

    "fun & games",
    "gardens",
    "art museums",

    "historical & heritage",
    "sports camps & clinics",
    "dolphin & whale watching",
    "shark diving",
    "health/fitness clubs & gyms",

    "bars & clubs",
    "architectural buildings",
    "climbing",
    "roman baths",
    "paint & pottery studios",

    "balloon rides",
    "islands",
    "skydiving",

    "lessons & workshops",
    "nature & parks",
    "museums",
    "waterskiing & jetskiing",

    "concerts & shows",
    "spas & wellness",
    "auto race tracks",
    "theme parks",

    "gear rentals",
    "horseback riding",
    "running",
    "golf courses",
    "art galleries",
    "sightseeing",
    "visitor centers",
    "shopping",
    "bowling alleys",

    "flea & street markets",
    "hiking trails",
    "safaris",

    "archaeology",
    "nature & wildlife",
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
        alert("Interests submitted successfully!");
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
