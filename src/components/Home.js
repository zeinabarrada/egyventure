import React, { useState, useEffect } from "react";
import axios from "axios";
import RecCards from "./ContentBasedRec/RecCards";
import MustSeeAttractions from "./ContentBasedRec/MustSeeAttractions";
import AttractionCard from "./ContentBasedRec/AttractionCard";
import { useAuth } from "./Registration/AuthContext";
import "./Home.css";

export default function Home() {
  const { user } = useAuth();
  const userId = user?.id;

  const [cityAttractions, setCityAttractions] = useState([]);
  const [activeCity, setActiveCity] = useState(null);
  const [likedItems, setLikedItems] = useState([]);
  const [cities, setCities] = useState([]);

  // Fetch all attractions once to determine the list of cities
  useEffect(() => {
    const fetchAllAttractions = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/get_attractions/"
        );
        if (
          response.data.status === "success" ||
          response.data.status === 200
        ) {
          const allAttractions = response.data.data;
          const cityMap = allAttractions.reduce((acc, attr) => {
            const city = attr.city || "Other";
            if (!acc[city]) acc[city] = [];
            acc[city].push(attr);
            return acc;
          }, {});

          const availableCities = Object.keys(cityMap).filter(
            (city) => cityMap[city].length > 5
          );
          setCities(availableCities);

          // Set the first city as active by default
          if (availableCities.length > 0) {
            setActiveCity(availableCities[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching city list:", error);
      }
    };
    fetchAllAttractions();
  }, []);

  // Fetch attractions for the active city
  useEffect(() => {
    if (!activeCity) return;

    const fetchCityAttractions = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/filter_city/", {
          params: { city: activeCity },
        });
        setCityAttractions(response.data.attractions || []);
      } catch (error) {
        console.error(`Error fetching attractions for ${activeCity}:`, error);
        setCityAttractions([]); // Clear on error
      }
    };

    fetchCityAttractions();
  }, [activeCity]);

  // Fetch user's liked items
  useEffect(() => {
    if (!userId) return;
    const fetchLikes = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/view_likes/", {
          params: { user_id: userId },
        });
        if (response.data.success) {
          setLikedItems(
            response.data.attractions.map((a) => a._id || a.attraction_id)
          );
        }
      } catch (error) {
        console.error("Error fetching likes:", error);
      }
    };
    fetchLikes();
  }, [userId]);

  const toggleLike = async (attractionId) => {
    if (!userId) return;

    const isLiking = !likedItems.includes(attractionId);
    const prevLikedItems = [...likedItems];

    setLikedItems(
      isLiking
        ? [...likedItems, attractionId]
        : likedItems.filter((id) => id !== attractionId)
    );

    try {
      const endpoint = isLiking
        ? "http://127.0.0.1:8000/add_to_likes/"
        : "http://127.0.0.1:8000/remove_from_likes/";
      await axios.post(endpoint, {
        user_id: userId,
        attraction_id: attractionId,
      });
    } catch (error) {
      console.error("Like operation failed:", error);
      setLikedItems(prevLikedItems); // Revert on error
    }
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Discover Your Next Adventure</h1>
        <p>
          Personalized recommendations and Egypt's top attractions, curated just
          for you.
        </p>
      </header>

      <div className="sliders-section">
        <RecCards />
        <MustSeeAttractions />
      </div>

      {cities.length > 0 && (
        <section className="explore-cities-section">
          <div className="container">
            <header className="section-header">
              <h2>Explore Our Cities</h2>
            </header>
            <div className="city-selector">
              {cities.map((city) => (
                <button
                  key={city}
                  className={`city-btn ${activeCity === city ? "active" : ""}`}
                  onClick={() => setActiveCity(city)}
                >
                  {city}
                </button>
              ))}
            </div>
            <div className="city-attractions-grid">
              {cityAttractions.map((item) => (
                <AttractionCard
                  key={item.attraction_id || item._id}
                  item={item}
                  isLiked={likedItems.includes(item.attraction_id || item._id)}
                  onLikeToggle={toggleLike}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
