import React from "react";
import { useParams } from "react-router-dom";
import { FaStar, FaRegStar, FaMapMarkerAlt } from "react-icons/fa";
import { useAuth } from "../Registration/AuthContext";
import axios from "axios";
import "./AttractionDetail.css";
import AttractionsSlider from "./AttractionSlider";
import { useState, useEffect, useCallback } from "react";

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

  const handleRatingSubmit = async () => {
    if (userRating === 0 || hasRated) return;

    setIsSubmitting(true);

    try {
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
        await fetchRecommendations();
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
    <section className="attraction-detail-new">
      {/* Header Image with overlay */}
      <div className="header-image-container large">
        <img
          src={attraction.image}
          alt={attraction.name}
          className="header-image large"
        />
        <div className="header-overlay large">
          <div className="header-content large">
            <div className="header-rating large">
              <span className="star-badge large">
                <FaStar />{" "}
                {attraction.rating ? attraction.rating.toFixed(1) : "-"}
              </span>
            </div>
            <h1 className="header-title large">{attraction.name}</h1>
            <div className="header-location large">
              <FaMapMarkerAlt /> {attraction.city || "Unknown"}
            </div>
            <div className="header-rating-input">{renderRatingInput()}</div>
          </div>
        </div>
      </div>

      <div className="main-content-layout">
        {/* Left: About, Photos */}
        <div className="main-content-left">
          <section className="about-section card">
            <h2>About</h2>
            <p className="full-description">{attraction.description}</p>
          </section>

          {/* Photos Gallery */}
          <section className="photos-section">
            <h2>Photos</h2>
            <div className="photos-gallery">
              {photos.map((photo, idx) => (
                <image
                  key={idx}
                  src={photo}
                  alt={`Photo ${idx + 1}`}
                  className="gallery-photo"
                />
              ))}
            </div>
          </section>
        </div>

        {/* Right: Practical Info & Map */}
        <div className="main-content-right wide">
          <div className="practical-info-card large">
            <h3>Practical Information</h3>
            <div className="practical-info-item large">
              <span>Opening Hours:</span>
              <span>{openingHours}</span>
            </div>
            {attraction.website && (
              <div className="practical-info-item large">
                <span>Website:</span>
                <a
                  href={attraction.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Official Website
                </a>
              </div>
            )}
          </div>
          <div className="map-card large">
            <h3>Location</h3>
            <div className="map-embed large">
              <iframe
                title="Map"
                src={mapUrl}
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            <div className="address large">
              <span>
                {attraction.city ? `${attraction.city}, Egypt` : "Egypt"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {(hasRated || showRecommendations) && recommendations.length > 0 && (
        <div className="recommendations-section">
          <h2>You Might Also Like</h2>
          <AttractionsSlider title="" items={recommendations} userId={userId} />
        </div>
      )}
    </section>
  );
};

export default AttractionDetail;
