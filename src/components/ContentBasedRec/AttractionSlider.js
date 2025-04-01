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
import "./Card.css";
import { useNavigate } from "react-router-dom";

const AttractionsSlider = ({ title, fetchUrl, userId }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [likedItems, setLikedItems] = useState([]);
  const sliderRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(fetchUrl, {
          params: userId ? { id: userId } : {},
        });
        setItems(response.data.recommendations || response.data.must_see || []);
        if (userId) {
          const likesResponse = await axios.get(
            "http://127.0.0.1:8000/view_likes/",
            {
              params: { user_id: userId },
            }
          );
          if (likesResponse.data.success) {
            const likedIds = likesResponse.data.attractions.map(
              (attraction) => attraction._id
            );
            setLikedItems(likedIds);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [fetchUrl, userId]);

  const toggleLike = async (itemId) => {
    // Determine if we're liking or unliking
    const isLiking = !likedItems.includes(itemId);

    // Optimistically update the UI first
    const newLikedItems = isLiking
      ? [...likedItems, itemId]
      : likedItems.filter((id) => id !== itemId);
    setLikedItems(newLikedItems);

    if (userId) {
      try {
        // Call the appropriate endpoint based on action
        const endpoint = isLiking
          ? "http://127.0.0.1:8000/add_to_likes/"
          : "http://127.0.0.1:8000/remove_from_likes/";

        const response = await axios.post(endpoint, {
          user_id: userId,
          attraction_id: itemId,
        });

        if (!response.data.success) {
          throw new Error(response.data.message || "Like operation failed");
        }
      } catch (error) {
        console.error("Error updating likes:", error);
        // Revert UI if API fails
        setLikedItems(likedItems);
      }
    }
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

  const toggleDescription = (itemId) => {
    setExpandedCards((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const truncateDescription = (text, itemId, maxLength = 100) => {
    if (!text) return "";
    return expandedCards[itemId] || text.length <= maxLength
      ? text
      : text.substring(0, maxLength) + "...";
  };

  return (
    <section className="recommendations-section">
      <div className="container">
        <header className="section-header">
          <h2>
            <span className="highlight">{title}</span>
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
            {items.length > 0 ? (
              items.map((item) => (
                <article
                  key={item.id}
                  className="recommendation-card"
                  onClick={() => navigate(`/attractions/${item.id}`)}
                >
                  <div className="card-media">
                    <img src={item.image} alt={item.name} loading="lazy" />
                    <button
                      className={`like-btn ${
                        likedItems.includes(item.id) ? "liked" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(item.id);
                      }}
                      aria-label={
                        likedItems.includes(item.id) ? "Unlike" : "Like"
                      }
                    >
                      {likedItems.includes(item.id) ? (
                        <FaHeart />
                      ) : (
                        <FaRegHeart />
                      )}
                    </button>
                    <div className="card-badges">
                      <span className="location-badge">
                        <FaMapMarkerAlt />{" "}
                        {item.location || item.city || "Unknown"}
                      </span>
                      {item.century && (
                        <span className="era-badge">
                          <FaCalendarAlt /> {item.century}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="card-content">
                    <h3>{item.name}</h3>
                    <div className="description-container">
                      <p className="description">
                        {truncateDescription(item.description, item.id)}
                      </p>
                      {item.description && item.description.length > 100 && (
                        <button
                          className="read-more-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDescription(item.id);
                          }}
                        >
                          {expandedCards[item.id] ? "Read Less" : "Read More"}
                        </button>
                      )}
                    </div>
                    <div className="card-footer">
                      <span className="category-tag">
                        {item.categories?.split(",")[0]?.trim() || "Attraction"}
                      </span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="no-results">
                <p>Loading {title.toLowerCase()}...</p>
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

export default AttractionsSlider;
