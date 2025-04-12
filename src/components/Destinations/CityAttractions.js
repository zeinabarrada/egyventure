import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

import AttractionsSlider from "../ContentBasedRec/AttractionSlider";
const CityAttractions = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const city = query.get("city");
  const [attractions, setAttractions] = useState([]);

  useEffect(() => {
    const fetchCityAttractions = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/filter_city/`, {
          params: { city: city },
        });
        setAttractions(response.data.attractions);
      } catch (error) {
        console.error("Error fetching attractions:", error);
      }
    };

    if (city) fetchCityAttractions();
  }, [city]);

  return (
    <AttractionsSlider
      key={city}
      title={city}
      items={attractions}
      cityName={city}
      fetchUrl={null} // Prevent duplicate fetching
    />
  );
};

export default CityAttractions;
