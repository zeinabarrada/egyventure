import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./Card.css";
import { useNavigate } from "react-router-dom";
import AttractionCard from "./AttractionCard";

const AttractionsSlider = ({
  title,
  fetchUrl,
  showViewAll = false,
  cityName = null,
  userId,
  items: propItems = [],
}) => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [likedItems, setLikedItems] = useState([]);
  const sliderRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const getItemId = (item) => item.attraction_id || item._id || item.id;
  useEffect(() => {
    if (propItems && propItems.length > 0) {
      setItems(propItems);
      return;
    }
    if (propItems.length === 0 && fetchUrl) {
      const fetchData = async () => {
        try {
          const response = await axios.get(fetchUrl, {
            params: userId ? { user_id: userId } : {},
          });
          setItems(
            response.data.recommendations || response.data.must_see || []
          );
        } catch (error) {
          console.error("Error fetching data:", error);
        }

        // Fetch likes (optional part, keep as is)
        if (userId) {
          try {
            const likesResponse = await axios.get(
              "http://127.0.0.1:8000/view_likes/",
              {
                params: { user_id: userId },
              }
            );
            if (likesResponse.data.success) {
              const newLikedIds = likesResponse.data.attractions.map(
                (a) => a._id || a.attraction_id
              );
              setLikedItems(newLikedIds);
            }
          } catch (error) {
            console.error("Error fetching likes:", error);
          }
        }
      };

      fetchData();
    }
  }, [fetchUrl, userId]);

  const toggleLike = async (itemId) => {
    // Get the complete item to ensure we have all ID fields
    const item = items.find(
      (item) =>
        item.id === itemId ||
        item.attraction_id === itemId ||
        item._id === itemId
    );

    // Use the most specific ID available
    const attractionId = item?.attraction_id || item?._id || itemId;

    const isLiking = !likedItems.includes(attractionId);
    const prevLikedItems = [...likedItems];

    // Optimistic UI update
    setLikedItems(
      isLiking
        ? [...likedItems, attractionId]
        : likedItems.filter((id) => id !== attractionId)
    );

    if (userId) {
      try {
        const endpoint = isLiking
          ? "http://127.0.0.1:8000/add_to_likes/"
          : "http://127.0.0.1:8000/remove_from_likes/";

        const response = await axios.post(endpoint, {
          user_id: userId,
          attraction_id: attractionId, // Always use the resolved ID
        });
        if (response.data.success && response.data.user) {
          // Force refresh liked items from backend
          const likesResponse = await axios.get(
            "http://127.0.0.1:8000/view_likes/",
            {
              params: { user_id: userId },
            }
          );
          if (likesResponse.data.success) {
            const newLikedIds = likesResponse.data.attractions.map(
              (a) => a._id || a.attraction_id
            );
            setLikedItems(newLikedIds);
          }
        }

        if (!response.data.success) {
          throw new Error(response.data.message);
        }
      } catch (error) {
        console.error("Like operation failed:", error);
        setLikedItems(prevLikedItems); // Revert on error
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

  if (items.length <= 5) return null;

  return (
    <section className="recommendations-section">
      {title && <h2 className="recommendations-title">{title}</h2>}
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
            items.map((item) => {
              const itemId = getItemId(item);
              const isLiked = likedItems.includes(itemId);

              return (
                <AttractionCard
                  key={itemId}
                  item={item}
                  isLiked={isLiked}
                  onLikeToggle={toggleLike}
                />
              );
            })
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
    </section>
  );
};

export default AttractionsSlider;
