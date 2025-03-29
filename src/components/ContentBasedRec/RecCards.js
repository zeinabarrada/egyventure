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

const Recommendations = () => {
  const [cards, setCards] = useState([]);
  const [likedCards, setLikedCards] = useState([]);
  const { user } = useAuth();
  const userId = user?.id;
  const sliderRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      try {
        const response = await axios.get("http://127.0.0.1:8000/word2vec/", {
          params: { id: userId },
        });
        setCards(response.data.recommendations);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [userId]);

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
            <span className="highlight">Recommended just for you</span>
          </h2>
          <p className="subtitle">Discover Egypt's hidden gems</p>
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
            {cards.length > 0 ? (
              cards.map((card) => (
                <article key={card.id} className="recommendation-card">
                  <div className="card-media">
                    <img src={card.image} alt={card.name} loading="lazy" />
                    <button
                      className={`like-btn ${
                        likedCards.includes(card.id) ? "liked" : ""
                      }`}
                      onClick={() => toggleLike(card.id)}
                      aria-label={
                        likedCards.includes(card.id) ? "Unlike" : "Like"
                      }
                    >
                      {likedCards.includes(card.id) ? (
                        <FaHeart />
                      ) : (
                        <FaRegHeart />
                      )}
                    </button>
                    <div className="card-badges">
                      <span className="location-badge">
                        <FaMapMarkerAlt /> {card.location || "Cairo"}
                      </span>
                      {card.century && (
                        <span className="era-badge">
                          <FaCalendarAlt /> {card.century}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="card-content">
                    <h3>{card.name}</h3>
                    <p className="description">{card.descriptions}</p>
                    <div className="card-footer">
                      <span className="category-tag">Historical Site</span>
                      <div className="rating">★★★★☆</div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="no-results">
                <p>We're curating special recommendations for you...</p>
                <button className="refresh-btn">Refresh Recommendations</button>
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

export default Recommendations;
