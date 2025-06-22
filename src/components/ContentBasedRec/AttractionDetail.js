import React from "react";
import { useParams } from "react-router-dom";
import {
  FaStar,
  FaRegStar,
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { useAuth } from "../Registration/AuthContext";
import axios from "axios";
import "./AttractionDetail.css";
import AttractionsSlider from "./AttractionSlider";
import { useState, useEffect, useCallback } from "react";
import defaultAvatar from "../Navigation/defaultAvatar.jpg";

const AttractionDetail = () => {
  const { id } = useParams();
  const [attraction, setAttraction] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const { user } = useAuth();
  const userId = user?.id;
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [openingHours, setOpeningHours] = useState("N/A");
  const apiKey = "fsq3hWZ0zIBseg8iZpDqUL/2HJsvTvgca10r5yp7oYcMbF4=";
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [ratingMessage, setRatingMessage] = useState("");
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    const fetchAttraction = async () => {
      try {
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

        if (userId) {
          const ratingsResponse = await axios.get(
            `http://127.0.0.1:8000/view_ratings/`,
            { params: { user_id: userId } }
          );
          if (ratingsResponse.data.ratings) {
            const attractionRating = ratingsResponse.data.ratings.find(
              (rating) => String(rating.attraction_id) === String(id)
            );

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

  useEffect(() => {
    const fetchOpeningHours = async () => {
      if (!attraction?.name) {
        console.log("No attraction name found");
        return;
      }
      const query = attraction.name;
      const near = attraction.city ? `${attraction.city}, Egypt` : "Egypt";
      try {
        // Step 1: Search for the place to get fsq_id
        const searchUrl = `https://api.foursquare.com/v3/places/search?query=${encodeURIComponent(
          query
        )}&near=${encodeURIComponent(near)}&limit=1`;
        console.log("Search URL:", searchUrl);
        const searchResponse = await fetch(searchUrl, {
          headers: {
            Accept: "application/json",
            Authorization: apiKey,
          },
        });
        const searchData = await searchResponse.json();
        const fsq_id = searchData.results?.[0]?.fsq_id;
        if (!fsq_id) return;
        // Step 2: Get place details (including opening hours)
        const detailsUrl = `https://api.foursquare.com/v3/places/${fsq_id}`;
        console.log("Details URL:", detailsUrl);
        const detailsResponse = await fetch(detailsUrl, {
          headers: {
            Accept: "application/json",
            Authorization: apiKey,
          },
        });
        const detailsData = await detailsResponse.json();
        console.log("Details Data:", detailsData);
        const hours = detailsData.hours?.display || "N/A";
        setOpeningHours(hours);
      } catch (err) {
        setOpeningHours("N/A");
        console.error("Error fetching opening hours:", err);
      }
    };
    fetchOpeningHours();
  }, [attraction]);

  const fetchRecommendations = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/pearson_similarity/`,
        {
          params: { attraction_id: id },
        }
      );

      setRecommendations(response.data.attractions || []);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  }, [userId]);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/get_reviews/`, {
        params: { attraction_id: id },
      });
      if (response.data.reviews) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  }, [id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleStarClick = async (rating) => {
    if (hasRated || isSubmitting) return;

    setIsSubmitting(true);
    setUserRating(rating);

    try {
      const response = await axios.post(`http://127.0.0.1:8000/rate/`, {
        user_id: userId,
        attraction_id: id,
        rating: rating,
      });

      if (
        response.status === 200 ||
        response.data?.success ||
        response.data?.status === "success"
      ) {
        setHasRated(true);
        setAttraction((prev) => ({ ...prev, user_rating: rating }));
        setRatingMessage("Thank you for your rating!");
        setShowRecommendations(true);
        await fetchRecommendations();
      } else {
        throw new Error(response.data.message || "Failed to submit rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      setRatingMessage("Failed to submit rating. Please try again.");
      setUserRating(0); // Reset on error
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setRatingMessage(""), 4000);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newReview.trim()) return;

    try {
      await axios.post(`http://127.0.0.1:8000/add_review/`, {
        user_id: userId,
        attraction_id: id,
        review: newReview,
      });
      setNewReview("");
      fetchReviews();
    } catch (error) {
      console.error("Error adding review:", error);
    }
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!editingReview || !editingReview.review.trim()) return;

    try {
      await axios.put(`http://127.0.0.1:8000/edit_review/`, {
        review_id: editingReview._id,
        review: editingReview.review,
      });
      setEditingReview(null);
      fetchReviews();
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/delete_review/`, {
          params: { review_id: reviewId },
        });
        fetchReviews();
      } catch (error) {
        console.error("Error deleting review:", error);
      }
    }
  };

  const renderRatingInput = () => {
    if (hasRated) {
      return (
        <div className="previous-rating">
          <h3>Your Rating:</h3>
          <div className="rated-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={`rated-${star}`}
                className={`star ${
                  star <= userRating ? "rated" : "rated-empty"
                }`}
              />
            ))}
          </div>
          {ratingMessage && (
            <p className="rating-message success">{ratingMessage}</p>
          )}
        </div>
      );
    }
    return (
      <div className="rating-input">
        <h3>Rate this attraction:</h3>
        <div className="stars-input">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={`input-${star}`}
              className={`star interactive ${
                star <= (hoverRating || userRating) ? "full" : "empty"
              }`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => handleStarClick(star)}
            />
          ))}
        </div>
        {isSubmitting && (
          <p className="rating-message">Submitting your rating...</p>
        )}
        {ratingMessage && (
          <p className="rating-message error">{ratingMessage}</p>
        )}
      </div>
    );
  };

  if (!attraction) return <div className="error">Attraction not found</div>;

  // Photos gallery: use attraction.photos if available, else fallback to [attraction.image]
  const photos =
    attraction.photos && attraction.photos.length > 0
      ? attraction.photos
      : [attraction.image];

  // Google Maps embed URL (basic, by city)
  const mapQuery = encodeURIComponent(
    attraction.city
      ? `${attraction.name}, ${attraction.city}, Egypt`
      : attraction.name
  );
  const mapUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`;

  return (
    <div className="swiper-container">
      <div className="backdrop-image">
        <img
          src={attraction.image}
          alt={attraction.name}
          className="backdrop-img"
        />
        <div className="gradient-overlay"></div>
      </div>
      <div className="backdrop-content">
        <h1>{attraction.name}</h1>
        <div className="movie-meta">
          <span>
            <FaMapMarkerAlt /> {attraction.city}
          </span>
          <span>
            <FaStar />{" "}
            {attraction.rating ? attraction.rating.toFixed(1) : "N/A"}
          </span>
          <span>{attraction.category}</span>
        </div>
        <p className="overview">{attraction.description}</p>
        <button
          className="view-map-btn"
          onClick={() => setIsMapModalOpen(true)}
        >
          View on Map
        </button>
        {renderRatingInput()}
      </div>

      {isMapModalOpen && (
        <div
          className="map-modal-overlay"
          onClick={() => setIsMapModalOpen(false)}
        >
          <div
            className="map-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-modal-btn"
              onClick={() => setIsMapModalOpen(false)}
            >
              &times;
            </button>
            <iframe
              title="Map"
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: "8px" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      )}

      {showRecommendations && recommendations.length > 0 && (
        <div style={{ marginTop: "3rem" }}>
          <AttractionsSlider
            title="You might also like"
            items={recommendations}
            userId={userId}
          />
        </div>
      )}

      <div className="page-reviews-section">
        <h2>Reviews for {attraction.name}</h2>
        <div className="add-review-form">
          <form onSubmit={handleAddReview}>
            <textarea
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              placeholder="Write your review here..."
              rows="4"
            />
            <button type="submit">Submit Review</button>
          </form>
        </div>
        <div className="reviews-list">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review._id} className="review-item">
                <img src={defaultAvatar} alt="User" className="review-avatar" />
                <div className="review-content">
                  {editingReview?._id === review._id ? (
                    <form
                      onSubmit={handleUpdateReview}
                      className="edit-review-form"
                    >
                      <textarea
                        value={editingReview.review}
                        onChange={(e) =>
                          setEditingReview({
                            ...editingReview,
                            review: e.target.value,
                          })
                        }
                        rows="3"
                      />
                      <div className="edit-actions">
                        <button type="submit">Save Changes</button>
                        <button
                          type="button"
                          onClick={() => setEditingReview(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="review-header">
                        <span className="review-author">
                          {review.user_name || "Anonymous"}
                        </span>
                        {review.created_at && (
                          <span className="review-date">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="review-text">{review.review}</p>
                      {review.user_id === userId && (
                        <div className="review-actions">
                          <button
                            onClick={() => setEditingReview(review)}
                            className="icon-btn"
                            aria-label="Edit review"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="icon-btn danger"
                            aria-label="Delete review"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="no-reviews-text">
              No reviews yet. Be the first to write one!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttractionDetail;
