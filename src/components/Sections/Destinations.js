import React, { useState } from "react";
import "./Sections.css";

function Destinations() {
  const destinations = [
    { name: "Giza", image: "/giza.jpg" },
    { name: "Alexandria", image: "/alex.jpg" },
    { name: "Siwa", image: "/siwa.jpg" },
    { name: "Dahab", image: "/dahab.jpg" },
    { name: "Luxor", image: "/luxor.jpg" },
    { name: "Aswan", image: "/aswan.jpg" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const moveCarousel = (direction) => {
    if (direction === "left") {
      setCurrentIndex((prev) =>
        prev === 0 ? destinations.length - 1 : prev - 1
      );
    } else {
      setCurrentIndex((prev) =>
        prev === destinations.length - 1 ? 0 : prev + 1
      );
    }
  };

  return (
    <section className="destinations-section">
      <h1 className="section-title">Explore Destinations</h1>
      <div className="carousel-container">
        <button
          className="nav-btn prev-btn"
          onClick={() => moveCarousel("left")}
        >
          ‹
        </button>

        <div className="carousel-track">
          {destinations.map((destination, index) => (
            <div
              key={destination.name}
              className="carousel-item"
              style={{
                transform: `translateX(${-currentIndex * 100}%)`,
                transition: "transform 0.5s ease",
              }}
            >
              <div className="image-container">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="destination-image"
                />
              </div>
              <h3 className="destination-name">{destination.name}</h3>
            </div>
          ))}
        </div>

        <button
          className="nav-btn next-btn"
          onClick={() => moveCarousel("right")}
        >
          ›
        </button>
      </div>
    </section>
  );
}

export default Destinations;
