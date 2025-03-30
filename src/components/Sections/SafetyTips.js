import React, { useState } from "react";
import "./SafetyTips.css";

const SafetyTips = () => {
  const [activeSection, setActiveSection] = useState("general");

  const safetyData = [
    {
      id: "general",
      title: "General Safety",
      content: [
        "Keep copies of your passport and important documents in a separate place from the originals.",
        "Be aware of your surroundings, especially in crowded tourist areas and markets.",
        "Avoid displaying expensive jewelry, cameras, or electronics that might draw unwanted attention.",
        "Only use licensed taxis or ride-hailing apps like Uber or Careem for transportation.",
        "Learn basic Arabic phrases for emergencies (help, police, doctor, etc.).",
      ],
    },
    {
      id: "transportation",
      title: "Transportation",
      content: [
        "Always agree on taxi fares before entering the vehicle or insist on using the meter.",
        "Avoid unmarked or unofficial transportation services.",
        "Women travelers may prefer women-only train carriages when available.",
        "Exercise extreme caution when crossing streets - traffic can be unpredictable.",
        "Use seatbelts whenever they are available in vehicles.",
      ],
    },
    {
      id: "cultural",
      title: "Cultural Considerations",
      content: [
        "Dress modestly, especially when visiting religious sites (shoulders and knees covered).",
        "Always ask permission before photographing local people.",
        "Avoid public displays of affection as they may offend local sensibilities.",
        "Respect prayer times and remove shoes before entering mosques.",
        "During Ramadan, avoid eating, drinking, or smoking in public during daylight hours.",
      ],
    },
    {
      id: "health",
      title: "Health & Hygiene",
      content: [
        "Drink only bottled water and avoid ice in drinks unless you're sure it was made with purified water.",
        "Use high SPF sunscreen and stay hydrated, especially in summer months.",
        "Be cautious with street food - choose busy vendors with high turnover.",
        "Carry hand sanitizer and basic medications (anti-diarrheal, pain relievers, etc.).",
        "Consider travel insurance that includes medical coverage and evacuation.",
      ],
    },
    {
      id: "emergency",
      title: "Emergency Information",
      content: [
        "Tourist Police: 126 (English-speaking officers available)",
        "Ambulance: 123",
        "Fire Department: 180",
        "Save your country's embassy contact information before traveling",
        "Keep your hotel's address and contact number with you at all times",
      ],
    },
  ];

  const currentSection = safetyData.find(
    (section) => section.id === activeSection
  );

  return (
    <div className="safety-tips-container">
      <aside className="safety-nav">
        <h2>Safety Topics</h2>
        <nav>
          <ul>
            {safetyData.map((section) => (
              <li
                key={section.id}
                className={activeSection === section.id ? "active" : ""}
                onClick={() => setActiveSection(section.id)}
              >
                {section.title}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="safety-content">
        <header>
          <h1>Egypt Travel Safety Guide</h1>
          <p className="subtitle">
            Essential tips for a safe and enjoyable journey through Egypt
          </p>
        </header>

        <article>
          <h2>{currentSection.title}</h2>
          <ul className="tips-list">
            {currentSection.content.map((tip, index) => (
              <li key={index}>
                <span className="tip-number">{index + 1}.</span>
                {tip}
              </li>
            ))}
          </ul>

          {activeSection === "emergency" && (
            <div className="emergency-box">
              <h3>Important Notice</h3>
              <p>
                In case of serious emergency, contact your embassy immediately.
                Most embassies have 24/7 emergency numbers for their citizens.
              </p>
            </div>
          )}
        </article>
      </main>
    </div>
  );
};

export default SafetyTips;
