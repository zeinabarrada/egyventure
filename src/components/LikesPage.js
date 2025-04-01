import React, { useEffect, useState } from "react";
import { FaHeart, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./Registration/AuthContext";
import "./LikesPage.css";

const LikesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;
  const [likedAttractions, setLikedAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLikedAttractions = async () => {
      if (!userId) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`http://127.0.0.1:8000/view_likes/`, {
          params: { user_id: userId },
          headers: { Accept: "application/json" },
        });

        if (response.data.success) {
          setLikedAttractions(response.data.attractions || []);
        } else {
          throw new Error(
            response.data.error || "Failed to fetch liked attractions"
          );
        }
      } catch (err) {
        console.error("Error fetching liked attractions:", err);
        setError(err.message || "Failed to load your liked attractions");
      } finally {
        setLoading(false);
      }
    };

    fetchLikedAttractions();
  }, [userId]);

  const handleUnlike = async (attractionId) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/remove_from_likes/",
        {
          user_id: userId,
          attraction_id: attractionId,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        setLikedAttractions((prev) =>
          prev.filter((attraction) => attraction._id !== attractionId)
        );
      } else {
        throw new Error(response.data.error || "Failed to unlike attraction");
      }
    } catch (err) {
      console.error("Error unliking attraction:", err);
      setError(err.message || "Failed to unlike attraction");
    }
  };

  if (loading) {
    return (
      <div className="likes-container">
        <h1 className="page-title">Your Liked Attractions</h1>
        <div className="no-results">
          <p>Loading your liked attractions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="likes-container">
        <h1 className="page-title">Your Liked Attractions</h1>
        <div className="no-results">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="likes-container">
      <h1 className="page-title">Your Liked Attractions</h1>

      <div className="attractions-grid">
        {likedAttractions.length > 0 ? (
          likedAttractions.map((attraction) => (
            <div key={attraction._id} className="attraction-card">
              <div className="card-image-container">
                <img
                  src={
                    attraction.image ||
                    "https://via.placeholder.com/400x300?text=No+Image"
                  }
                  alt={attraction.name}
                  className="card-image"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x300?text=Image+Not+Found";
                  }}
                />
              </div>

              <div className="card-content">
                <div className="card-header">
                  <h2 className="attraction-name">{attraction.name}</h2>
                  <button
                    className="like-btn liked"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnlike(attraction._id);
                    }}
                    aria-label="Unlike"
                  >
                    <FaHeart />
                  </button>
                </div>

                <p className="attraction-description">
                  {attraction.description}
                </p>

                <div className="card-meta">
                  {attraction.city && (
                    <span className="location">
                      <FaMapMarkerAlt /> {attraction.city}
                    </span>
                  )}
                  {attraction.century && (
                    <span className="era">
                      <FaCalendarAlt /> {attraction.century}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>You haven't liked any attractions yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikesPage;
