import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaStar,
  FaRegStar,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import { useAuth } from "../Registration/AuthContext";
import axios from "axios";
import "./AttractionDetail.css";
import { useState, useEffect } from "react";
const AttractionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attraction, setAttraction] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    const fetchAttraction = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/get_attraction_details/`,
          {
            params: { attraction_id: id },
          }
        );

        // Check if the response contains the expected data
        if (response.data.status === "success") {
          setAttraction(response.data.attraction);
        } else {
          throw new Error(response.data.message || "Invalid data received");
        }
      } catch (error) {
        console.error("Error fetching attraction:", error);
      }
    };
    fetchAttraction();
  }, [id]);

  const handleRatingSubmit = async () => {
    if (userRating === 0) return; // Don't submit if no rating selected

    setIsSubmitting(true);
    try {
      // Replace with your actual API endpoint for submitting ratings
      const response = await axios.post(`http://127.0.0.1:8000/rate/`, {
        user_id: userId,
        attraction_id: id,
        rating: userRating,
      });

      if (response.data.status === "success") {
        // Update the attraction with new average rating if needed
        // You might want to refetch the attraction data or update locally
        alert("Rating submitted successfully!");
      } else {
        throw new Error(response.data.message || "Failed to submit rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Failed to submit rating. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRatingInput = () => {
    return (
      <div className="rating-input">
        <h3>Rate this attraction:</h3>
        <div className="stars-input">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={`input-${star}`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setUserRating(star)}
            >
              {star <= (hoverRating || userRating) ? (
                <FaStar className="star interactive full" />
              ) : (
                <FaRegStar className="star interactive empty" />
              )}
            </span>
          ))}
        </div>
        <button
          onClick={handleRatingSubmit}
          disabled={userRating === 0 || isSubmitting}
          className="submit-rating-button"
        >
          {isSubmitting ? "Submitting..." : "Submit Rating"}
        </button>
      </div>
    );
  };

  if (!attraction) return <div className="error">Attraction not found</div>;

  return (
    <section className="attraction-detail">
      <div className="detail-header">
        <h1>{attraction.name}</h1>
        <div className="detail-rating">{renderRatingInput()}</div>
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
          <span className="category">{attraction.categories}</span>
          <span className="price-range">{attraction.price_range}</span>
        </div>
      </div>
    </section>
  );
};

export default AttractionDetail;
