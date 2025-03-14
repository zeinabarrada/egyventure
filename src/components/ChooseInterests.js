import { useState } from "react";
import "./ChooseInterests.css";

export default function ChooseInterests() {
  const interestsList = [
    "Must-see Attractions",
    "Great Food",
    "Hidden Gems",
    "River Cruises in London",
    "Explore Royal London",
    "Historical Pub Tours",
    "Iconic Landmarks",
    "Art Galleries",
    "Theatre and Performing Arts",
    "Royal Heritage",
    "Luxury Shopping",
    "Outdoors",
  ];

  // ✅ Fix 1: Initialize selectedInterests as an empty array
  const [selectedInterests, setSelectedInterests] = useState([]);

  // ✅ Fix 2: Proper function definition
  const toggleInterest = (interest) => {
    setSelectedInterests(
      (prev) =>
        prev.includes(interest)
          ? prev.filter((item) => item !== interest) // Deselect
          : [...prev, interest] // Select
    );
  };

  // ✅ Fix 3: Add a return statement for rendering
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
          <button className="submit-btn">Submit</button>
        </div>
      </div>
    </div>
  );
}
