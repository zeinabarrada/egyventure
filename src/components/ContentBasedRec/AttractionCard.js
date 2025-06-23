import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import "./Card.css";

const AttractionCard = ({ item, isLiked, onLikeToggle }) => {
  const navigate = useNavigate();

  // Ensure item and its ID exists
  if (!item) {
    return null;
  }
  const itemId = item.attraction_id || item._id || item.id;
  if (!itemId) {
    return null; // Don't render if no unique ID
  }

  return (
    <article className="recommendation-card overlay-card">
      <button
        className={`like-btn ${isLiked ? "liked" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onLikeToggle(itemId);
        }}
        aria-label={isLiked ? "Unlike" : "Like"}
      >
        <FaHeart />
      </button>

      <div
        className="card-media overlay-media"
        onClick={() => navigate(`/attractions/${itemId}`)}
      >
        <img src={item.image} alt={item.name} loading="lazy" />
        <div className="overlay-content">
          <h3 className="overlay-title">{item.name}</h3>
          <p className="overlay-description">{item.description}</p>
        </div>
      </div>
    </article>
  );
};

export default AttractionCard;
