import React from "react";
import RecCards from "./ContentBasedRec/RecCards";
import MustSeeAttractions from "./ContentBasedRec/MustSeeAttractions";
import { useState, useEffect } from "react";
import AttractionsSlider from "./ContentBasedRec/AttractionSlider";
import axios from "axios";
import { useAuth } from "./Registration/AuthContext";
import "./ContentBasedRec/Card.css";

export default function Home() {
  const [attractions, setAttractions] = useState([]);
  const [visibleCities, setVisibleCities] = useState(3);
  const { user } = useAuth();
  const userId = user?.id;
  
  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/get_attractions/"
        );
        console.log(response.data);
        if (
          response.data.status === "success" ||
          response.data.status === 200
        ) {
          setAttractions(response.data.data);
        } else {
          throw new Error("Failed to fetch attractions");
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchAttractions();
  }, []);
  const groupByCity = (attractions) => {
    return attractions.reduce((acc, attraction) => {
      const city = attraction.city || "Other";
      if (!acc[city]) acc[city] = [];
      acc[city].push(attraction);
      return acc;
    }, {});
  };

  const cities = groupByCity(attractions);
  const cityEntries = Object.entries(cities);
  return (
    <div>
      <RecCards />
      <MustSeeAttractions />
      {cityEntries.slice(0, visibleCities).map(([city, cityAttractions]) => (
        <AttractionsSlider
          key={city}
          title={city}
          items={cityAttractions}
          userId={userId}
          showViewAll={true}
          cityName={city}
          fetchUrl={null} // Prevent duplicate fetching
        />
      ))}
      {visibleCities < cityEntries.length && (
        <div className="load-more-container">
          <button
            onClick={() => setVisibleCities((prev) => prev + 3)}
            className="load-more-btn"
          >
            Load More Cities
          </button>
        </div>
      )}
    </div>
  );
}
