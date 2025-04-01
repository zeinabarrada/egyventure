import React, { useEffect, useState } from "react";
import { FaHeart, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./Registration/AuthContext";

const LikesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;
  const [likedCards, setLikedCards] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return; // Ensure userId is available before fetching
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/user_likes/?user_id=${userId}`
        );
        setLikedCards(response.data.liked_attractions || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [userId]);

  // const onUnlike = async (attractionId) => {
  //   try {
  //     await axios.delete(`http://127.0.0.1:8000/user_likes/${attractionId}/`, {
  //       data: { user_id: userId },
  //     });
  //     setLikedCards((prevCards) =>
  //       prevCards.filter((attraction) => attraction.id !== attractionId)
  //     );
  //   } catch (error) {
  //     console.error("Error unliking attraction:", error);
  //   }
  // };

  return (
    <section className="recommendations-section">
      <div className="container">
        <header className="section-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back to Recommendations
          </button>
          <h2>
            <span className="highlight">Your Liked Attractions</span>
          </h2>
        </header>

        <div className="recommendations-grid">
          {likedCards.length > 0 ? (
            likedCards.map((attraction) => (
              <article key={attraction.id} className="recommendation-card">
                <div className="card-media">
                  <img
                    src={attraction.image}
                    alt={attraction.name}
                    loading="lazy"
                  />
                  <button
                    className="like-btn liked"
                    // onClick={() => onUnlike(attraction.id)}
                    aria-label="Unlike"
                  >
                    <FaHeart />
                  </button>
                  <div className="card-badges">
                    <span className="location-badge">
                      <FaMapMarkerAlt /> {attraction.location || "Cairo"}
                    </span>
                    {attraction.century && (
                      <span className="era-badge">
                        <FaCalendarAlt /> {attraction.century}
                      </span>
                    )}
                  </div>
                </div>
                <div className="card-content">
                  <h3>{attraction.name}</h3>
                  <p className="description">{attraction.descriptions}</p>
                  <div className="card-footer">
                    <span className="category-tag">Historical Site</span>
                    <div className="rating">★★★★☆</div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="no-results">
              <p>You haven't liked any attractions yet</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LikesPage;
