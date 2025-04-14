import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Weather from "./Weather";
import AttractionsSlider from "../ContentBasedRec/AttractionSlider";

const CityAttractions = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const city = query.get("city");
  const [attractions, setAttractions] = useState([]);
  const normalizedCity = city?.trim().toLowerCase();

  useEffect(() => {
    const fetchCityAttractions = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/filter_city/`, {
          params: { city: normalizedCity },
        });
        const attractionsData = Array.isArray(response.data?.attractions)
          ? response.data.attractions
          : [];
        console.log(response.data.attractions);
        setAttractions(attractionsData);
      } catch (error) {
        console.error("Error fetching attractions:", error);
      }
    };

    fetchCityAttractions();
  }, [normalizedCity]);

  return (
    <div className="city-content-wrapper">
      <div className="attractions-main-content">
        <AttractionsSlider
          key={normalizedCity}
          title={`Destinations in ${city}`}
          items={attractions}
          cityName={normalizedCity}
          fetchUrl={
            (`http://127.0.0.1:8000/filter_city/`,
            {
              params: { city: normalizedCity },
            })
          } // Prevent duplicate fetching
        />
      </div>
      <div className="weather-sidebar">
        <Weather city={city} />
      </div>
    </div>
  );
};

export default CityAttractions;
