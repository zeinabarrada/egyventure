import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaStar,
  FaRegStar,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import axios from "axios";
import "./Card.css";
import { useState, useEffect } from "react";
const AttractionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attraction, setAttraction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttraction = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/attractions/${id}/`
        );
        setAttraction(response.data);
      } catch (error) {
        console.error("Error fetching attraction:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttraction();
  }, [id]);

  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="star full" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStar key="half" className="star half" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="star empty" />);
    }

    return stars;
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!attraction) return <div className="error">Attraction not found</div>;

  return (
    <section className="attraction-detail">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back to Recommendations
      </button>

      <div className="detail-header">
        <h1>{attraction.name}</h1>
        <div className="detail-rating">
          {renderRating(attraction.rating)}
          <span>({attraction.review_count} reviews)</span>
        </div>
      </div>

      <div className="detail-image">
        <img src={attraction.image} alt={attraction.name} />
      </div>

      <div className="detail-badges">
        <span className="location-badge">
          <FaMapMarkerAlt /> {attraction.city || "Unknown"}
        </span>
        {attraction.century && (
          <span className="era-badge">
            <FaCalendarAlt /> {attraction.century}
          </span>
        )}
      </div>

      <div className="detail-content">
        <p className="full-description">{attraction.description}</p>

        <div className="detail-meta">
          <span className="category">{attraction.category}</span>
          <span className="price-range">{attraction.price_range}</span>
        </div>
      </div>
    </section>
  );
};

export default AttractionDetail;
