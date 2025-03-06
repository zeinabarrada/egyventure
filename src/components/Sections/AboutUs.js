import React, { forwardRef } from "react";
import "./Sections.css";

function AboutUs() {
  return (
    <>
      {" "}
      <section id="aboutus" className="section about-us-section">
        <div className="about-content">
          <h2>About Us</h2>
          <p className="about-text">
            Welcome to <strong>EGYVENTURE</strong>, your ultimate guide to
            exploring the wonders of Egypt! We are passionate about travel and
            dedicated to helping you discover the rich history, vibrant culture,
            and breathtaking landscapes of this incredible country.
          </p>
          <p className="about-text">
            Our mission is to provide you with the best travel experiences, from
            iconic landmarks like the Pyramids of Giza to hidden gems off the
            beaten path. Whether you're a history enthusiast, an adventure
            seeker, or simply looking for a relaxing getaway, we've got you
            covered.
          </p>
          <p className="about-text">
            We created this platform to make travel planning easier, safer, and
            more enjoyable. With curated recommendations, safety tips, and local
            insights, we aim to inspire and empower you to embark on
            unforgettable journeys.
          </p>
          <p className="about-text">
            Join us in exploring Egypt – where history meets adventure!
          </p>
        </div>
      </section>
    </>
  );
}

export default AboutUs;
