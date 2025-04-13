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
import AttractionsSlider from "./AttractionSlider";
import { useState, useEffect, useCallback } from "react";
const AttractionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attraction, setAttraction] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const { user } = useAuth();
  const userId = user?.id;
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    const fetchAttraction = async () => {
      try {
        // Fetch attraction details
        const attractionResponse = await axios.get(
          `http://127.0.0.1:8000/get_attraction_details/`,
          { params: { attraction_id: id } }
        );

        if (attractionResponse.data.status === "success") {
          setAttraction(attractionResponse.data.attraction);
        } else {
          throw new Error(
            attractionResponse.data.message || "Invalid data received"
          );
        }

        // Check if user has rated THIS specific attraction
        if (userId) {
          const ratingsResponse = await axios.get(
            `http://127.0.0.1:8000/view_ratings/`,
            { params: { user_id: userId } }
          );
          console.log(ratingsResponse.data);
          if (ratingsResponse.data.ratings) {
            // Find if this attraction exists in user's ratings
            const attractionRating = ratingsResponse.data.ratings.find(
              (rating) => String(rating.attraction_id) === String(id)
            );
            console.log("Found rating for this attraction:", attractionRating); // Debug log

            if (attractionRating) {
              setUserRating(attractionRating.rating);
              setHasRated(true);
              fetchRecommendations();
            }
          }
        }
      } catch (error) {
        console.error("Error fetching attraction:", error);
      }
    };
    fetchAttraction();
  }, [id, userId]);

  const fetchRecommendations = useCallback(async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/NMF_SVD/`, {
        params: { user_id: userId },
      });
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  }, [userId]);
  const handleRatingSubmit = async () => {
    if (userRating === 0 || hasRated) return; // Don't submit if no rating selected

    setIsSubmitting(true);

    try {
      // Replace with your actual API endpoint for submitting ratings
      const response = await axios.post(`http://127.0.0.1:8000/rate/`, {
        user_id: userId,
        attraction_id: id,
        rating: userRating,
      });
      const isSuccess =
        response.status === 200 ||
        response.data?.success ||
        response.data?.status === "success";
      if (isSuccess) {
        setHasRated(true);
        setAttraction((prev) => ({
          ...prev,
          user_rating: userRating,
        }));
        setShowRecommendations(true);

        // Fetch recommendations after successful rating
        await fetchRecommendations();
        console.log(hasRated);
        alert("Rating submitted successfully!");
      } else {
        throw new Error(response.data.message || "Failed to submit rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Failed to submit rating. Please try again.");
      setAttraction((prev) => ({
        ...prev,
        user_rating: 0,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRatingInput = () => {
    if (hasRated) {
      return (
        <div className="previous-rating">
          <h3>Your Rating:</h3>
          <div className="rated-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={`rated-${star}`}>
                {star <= userRating ? (
                  <FaStar className="star rated" />
                ) : (
                  <FaRegStar className="star rated-empty" />
                )}
              </span>
            ))}
          </div>
          <p className="rating-message">Thank you for your rating!</p>
        </div>
      );
    }
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
        </div>
        {(hasRated || showRecommendations) && recommendations.length > 0 && (
          <div className="recommendations-section">
            <AttractionsSlider
              title="You might also like"
              items={recommendations}
              userId={userId}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default AttractionDetail;
