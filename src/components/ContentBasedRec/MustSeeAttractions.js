import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  FaHeart,
  FaRegHeart,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useAuth } from "../Registration/AuthContext";
import "./Card.css";

const MustSeeAttractions = () => {
  const [attractions, setAttractions] = useState([]);
  const [likedCards, setLikedCards] = useState([]);
  const sliderRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [expandedCards, setExpandedCards] = useState({});
  const { user } = useAuth();
  const userId = user?.id;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/must_see/");
        const attractionsData = response.data.must_see || [];

        const processedAttractions = attractionsData.map((attraction) => ({
          id: attraction.id,
          name: attraction.name,
          description: attraction.description,
          image: attraction.image,
          city: attraction.city, // Map 'city' to 'location' if needed
          category:
            attraction.categories?.split(",")[0]?.trim() || "Attraction",
        }));

        setAttractions(processedAttractions);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchData();
  }, []);
  const toggleDescription = (cardId) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  // Truncate description function
  const truncateDescription = (text, cardId, maxLength = 100) => {
    if (!text) return "";
    if (expandedCards[cardId] || text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + "...";
  };

  const toggleLike = (cardId) => {
    setLikedCards((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId]
    );
  };

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: -sliderRef.current.offsetWidth,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: sliderRef.current.offsetWidth,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  return (
    <section className="recommendations-section">
      <div className="container">
        <header className="section-header">
          <h2>
            <span className="highlight">Must See Attractions</span>
          </h2>
        </header>

        <div className="slider-container">
          {showLeftArrow && (
            <button
              className="slider-arrow left-arrow"
              onClick={scrollLeft}
              aria-label="Scroll left"
            >
              <FaChevronLeft />
            </button>
          )}

          <div
            className="recommendations-grid"
            ref={sliderRef}
            onScroll={handleScroll}
          >
            {attractions.length > 0 ? (
              attractions.map((attraction) => (
                <article key={attraction.id} className="recommendation-card">
                  <div className="card-media">
                    <img
                      src={attraction.image}
                      alt={attraction.name}
                      loading="lazy"
                    />
                    <button
                      className={`like-btn ${
                        likedCards.includes(attraction.id) ? "liked" : ""
                      }`}
                      onClick={() => toggleLike(attraction.id)}
                      aria-label={
                        likedCards.includes(attraction.id) ? "Unlike" : "Like"
                      }
                    >
                      {likedCards.includes(attraction.id) ? (
                        <FaHeart />
                      ) : (
                        <FaRegHeart />
                      )}
                    </button>
                    <div className="card-badges">
                      <span className="location-badge">
                        <FaMapMarkerAlt /> {attraction.city || "Unknown"}
                      </span>
                    </div>
                  </div>
                  <div className="card-content">
                    <h3>{attraction.name}</h3>
                    <div className="description-container">
                      <p className="description">
                        {truncateDescription(
                          attraction.description,
                          attraction.id
                        )}
                      </p>
                      {attraction.description &&
                        attraction.description.length > 100 && (
                          <button
                            className="read-more-btn"
                            onClick={() => toggleDescription(attraction.id)}
                          >
                            {expandedCards[attraction.id]
                              ? "Read Less"
                              : "Read More"}
                          </button>
                        )}
                    </div>
                    <div className="card-footer">
                      <span className="category-tag">
                        {attraction.category}
                      </span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="no-results">
                <p>Loading must-see attractions...</p>
              </div>
            )}
          </div>

          {showRightArrow && (
            <button
              className="slider-arrow right-arrow"
              onClick={scrollRight}
              aria-label="Scroll right"
            >
              <FaChevronRight />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default MustSeeAttractions;
