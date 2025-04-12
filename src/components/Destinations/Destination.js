import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Destination.css";

const Destination = ({ attractions = [] }) => {
  const navigate = useNavigate();
  const [visibleCities, setVisibleCities] = useState(3); // Show 3 cities initially

  // Group attractions by city
  const cities = attractions.reduce((acc, attraction) => {
    if (!acc[attraction.city]) {
      acc[attraction.city] = [];
    }
    acc[attraction.city].push(attraction);
    return acc;
  }, {});

  return (
    <section className="destinations-section">
      <h2>Popular Destinations</h2>

      {Object.entries(cities)
        .slice(0, visibleCities)
        .map(([city, cityAttractions]) => (
          <div key={city} className="city-section">
            <div className="city-header">
              <h3>{city}</h3>
              <button
                onClick={() =>
                  navigate(`/attractions?city=${encodeURIComponent(city)}`)
                }
                className="view-all-btn"
              >
                View All
              </button>
            </div>

            <div className="city-attractions">
              {cityAttractions.slice(0, 4).map((attraction) => (
                <div key={attraction.attraction_id} className="attraction-card">
                  <img src={attraction.image} alt={attraction.name} />
                  <h4>{attraction.name}</h4>
                  <p>{attraction.description.substring(0, 60)}...</p>
                </div>
              ))}
            </div>
          </div>
        ))}

      {visibleCities < Object.keys(cities).length && (
        <button
          onClick={() => setVisibleCities((prev) => prev + 3)}
          className="load-more-btn"
        >
          Load More Destinations
        </button>
      )}
    </section>
  );
};

export default Destination;
