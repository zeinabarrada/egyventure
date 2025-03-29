import React from "react";
import "./AboutUs.css";

function AboutUs() {
  return (
    <section id="aboutus" className="about-us-section">
      <div className="about-container">
        <h2 className="section-title">About EGYVENTURE</h2>
        <div className="section-divider"></div>

        <div className="about-content">
          <p className="about-text">
            We're a team of passionate Egyptian travelers dedicated to showing
            visitors the <strong>real Egypt</strong> - beyond the typical
            tourist routes.
          </p>

          <div className="key-points">
            <div className="point">
              <span className="point-icon">✈️</span>
              <h3>Authentic Experiences</h3>
              <p>Curated adventures that reveal Egypt's true culture</p>
            </div>

            <div className="point">
              <span className="point-icon">🛡️</span>
              <h3>Safety First</h3>
              <p>Verified locations and reliable local guides</p>
            </div>

            <div className="point">
              <span className="point-icon">❤️</span>
              <h3>Local Love</h3>
              <p>Supporting community businesses and guides</p>
            </div>
          </div>

          <p className="closing-text">
            Our mission is simple: to help you experience Egypt's wonders{" "}
            <strong>safely</strong>, <strong>authentically</strong>, and{" "}
            <strong>memorably</strong>.
          </p>
        </div>
      </div>
    </section>
  );
}

export default AboutUs;
