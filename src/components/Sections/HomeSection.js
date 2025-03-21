import "./Home.css";
import { useNavigate } from "react-router-dom";

function HomeSection() {
  const navigate = useNavigate();
  return (
    <>
      <section id="home" className="section home-section">
        <div className="hero-content">
          <h1>Explore Egypt: Where History Meets Adventure</h1>
          <p className="hero-text">
            From the iconic pyramids to the serene Nile, Egypt is a land of
            wonders. Discover top attractions, hidden gems, and local favorites
            for an unforgettable adventure!
          </p>
          <button
            className="cta-button"
            onClick={() => navigate("/authentication")}
          >
            Begin your journey - Sign Up
          </button>
        </div>
      </section>
    </>
  );
}

export default HomeSection;
