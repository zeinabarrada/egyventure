import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import RecCards from "./ContentBasedRec/RecCards";
import MustSeeAttractions from "./ContentBasedRec/MustSeeAttractions";
import AttractionCard from "./ContentBasedRec/AttractionCard";
import { useAuth } from "./Registration/AuthContext";
import "./Home.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { user } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();

  const [cityAttractions, setCityAttractions] = useState([]);
  const [activeCity, setActiveCity] = useState(null);
  const [likedItems, setLikedItems] = useState([]);
  const [cities, setCities] = useState([]);
  const [cityPage, setCityPage] = useState(0);
  const citiesPerPage = 6;
  const paginatedCities = cities.slice(
    cityPage * citiesPerPage,
    (cityPage + 1) * citiesPerPage
  );

  const [attractionPage, setAttractionPage] = useState(0);
  const attractionsPerPage = 6;
  const paginatedAttractions = cityAttractions.slice(
    attractionPage * attractionsPerPage,
    (attractionPage + 1) * attractionsPerPage
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const searchRef = useRef();

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

  // Reset attractionPage to 0 when city changes
  useEffect(() => {
    setAttractionPage(0);
  }, [cityAttractions]);

  // Search logic for header search bar
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const fetchSearch = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/get_attractions/",
          {
            params: { search: searchTerm },
          }
        );
        if (
          response.data.status === "success" ||
          response.data.status === 200
        ) {
          const allAttractions = response.data.data || [];
          // Filter by name/description/city locally if needed
          const filtered = allAttractions
            .filter(
              (attr) =>
                attr.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                attr.description
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                attr.city?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .slice(0, 6);
          console.log(filtered);
          setSearchResults(filtered);
          setShowResults(true);
        }
      } catch (error) {
        setSearchResults([]);
        setShowResults(false);
      }
    };
    const timeout = setTimeout(fetchSearch, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Hide suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Discover Your Next Adventure</h1>
        <p>
          Personalized recommendations and Egypt's top attractions, curated just
          for you.
        </p>
        {/* Search Bar */}
        <div ref={searchRef} className="search-bar-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search attractions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
          />
          {showResults && searchResults.length > 0 && (
            <ul className="search-dropdown">
              {searchResults.map((attr) => (
                <li
                  key={attr.id || attr._id}
                  className="search-dropdown-item"
                  onClick={() => navigate(`/attractions/${attr.id}`)}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f5f7fa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#fff")
                  }
                >
                  <img
                    src={attr.image}
                    alt={attr.name}
                    className="search-dropdown-item-img"
                  />
                  <div className="search-dropdown-item">
                    <div className="search-title">{attr.name}</div>
                    <div className="search-city">{attr.city}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <div className="sliders-section">
        <div className="container">
          <h2 className="section-header">Destinations you might like</h2>

          <RecCards />
        </div>
        <div className="container">
          <h2 className="section-header">Must See Attractions</h2>

          <MustSeeAttractions />
        </div>
      </div>

      {cities.length > 0 && (
        <section className="explore-cities-section">
          <div className="container">
            <h2 className="section-header">Explore Egypt's Cities</h2>

            <div className="city-selector">
              {cityPage > 0 && (
                <button
                  className="city-btn"
                  onClick={() => setCityPage(cityPage - 1)}
                >
                  &lt;
                </button>
              )}
              {paginatedCities.map((city) => (
                <button
                  key={city}
                  className={`city-btn ${activeCity === city ? "active" : ""}`}
                  onClick={() => setActiveCity(city)}
                >
                  {city}
                </button>
              ))}
              {(cityPage + 1) * citiesPerPage < cities.length && (
                <button
                  className="city-btn"
                  onClick={() => setCityPage(cityPage + 1)}
                >
                  &gt;
                </button>
              )}
            </div>
            <div className="city-attractions-grid">
              {paginatedAttractions.map((item) => (
                <AttractionCard
                  key={item.attraction_id || item._id}
                  item={item}
                  isLiked={likedItems.includes(item.attraction_id || item._id)}
                  onLikeToggle={toggleLike}
                />
              ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "1.5rem",
              }}
            >
              {attractionPage > 0 && (
                <button
                  className="city-btn"
                  onClick={() => setAttractionPage(attractionPage - 1)}
                >
                  &lt; Prev
                </button>
              )}
              {(attractionPage + 1) * attractionsPerPage <
                cityAttractions.length && (
                <button
                  className="city-btn"
                  onClick={() => setAttractionPage(attractionPage + 1)}
                >
                  Next &gt;
                </button>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
