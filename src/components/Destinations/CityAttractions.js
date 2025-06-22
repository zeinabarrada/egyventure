import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import Weather from "./Weather";
import "./CityAttractions.css";

const CityAttractions = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const city = query.get("city");
  const [attractions, setAttractions] = useState([]);
  const normalizedCity = city?.trim().toLowerCase();

  useEffect(() => {
    const fetchCityAttractions = async () => {
      if (!city) return;
      try {
        const response = await axios.get(`http://127.0.0.1:8000/filter_city/`, {
          params: { city: normalizedCity },
        });
        const attractionsData = Array.isArray(response.data?.attractions)
          ? response.data.attractions
          : [];
        setAttractions(attractionsData);
      } catch (error) {
        console.error("Error fetching attractions:", error);
      }
    };

    fetchCityAttractions();
  }, [city, normalizedCity]);

  return (
    <div className="city-attractions-page">
      <header className="city-header">
        <div className="header-content">
          <h1>{city}</h1>
          <p>Explore top attractions in this vibrant city</p>
        </div>
      </header>

      <div className="city-main-content">
        <div className="attractions-grid">
          {attractions.map((attraction) => (
            <Link
              to={`/attractions/${attraction.attraction_id}`}
              key={attraction.attraction_id}
              className="attraction-card"
            >
              <img
                src={attraction.image}
                alt={attraction.name}
                className="attraction-card-img"
              />
              <div className="attraction-card-content">
                <h3>{attraction.name}</h3>
                <p>{attraction.description.substring(0, 100)}...</p>
              </div>
            </Link>
          ))}
        </div>
        <aside className="weather-sidebar">
          <Weather city={city} />
        </aside>
      </div>
    </div>
  );
};

export default CityAttractions;
