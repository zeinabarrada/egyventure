import React, { forwardRef } from "react";
import "./Sections.css";

function SafetyTips() {
  const tips = [
    {
      title: "Stay Hydrated",
      description:
        "The weather in Egypt can be extremely hot, especially during summer. Make sure to drink plenty of water and avoid dehydration, especially when visiting outdoor attractions like the pyramids.",
    },
    {
      title: "Respect Local Customs",
      description:
        "Egypt is a predominantly Muslim country, and it's important to respect local customs and traditions. Dress modestly and be mindful of cultural differences.",
    },
    {
      title: "Be Cautious with Street Vendors",
      description:
        "While many street vendors sell interesting products, always negotiate prices beforehand. Avoid buying anything that could be potentially unsafe or illegal.",
    },
    {
      title: "Avoid Public Displays of Affection",
      description:
        "Public displays of affection, such as kissing or hugging, are not acceptable in many public places in Egypt. It's best to keep these private to avoid unwanted attention.",
    },
    {
      title: "Use Trusted Transportation",
      description:
        "Only use trusted taxi services or ride-hailing apps like Uber or Careem. Avoid unlicensed taxis, as they may charge excessive fares or be unsafe.",
    },
    {
      title: "Keep Your Belongings Safe",
      description:
        "Petty theft can happen, especially in crowded tourist spots. Keep your valuables in a safe place, like a hotel safe, and be mindful of your surroundings.",
    },
    {
      title: "Follow the Local Laws",
      description:
        "Always follow the local laws, including those related to alcohol consumption, photography, and drug use. Violations can result in severe penalties.",
    },
  ];

  return (
    <div className="safety-tips-container">
      <h2>Safety Tips for Travelers in Egypt</h2>
      <ul className="safety-tips-list">
        {tips.map((tip, index) => (
          <li key={index} className="safety-tip">
            <h3>{tip.title}</h3>
            <p>{tip.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SafetyTips;
