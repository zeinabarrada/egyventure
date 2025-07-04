import Header from "./components/Header/Header.js";
import Home from "./components/Home.js";
import Destinations from "./components/Sections/Destinations.js";
import SafetyTips from "./components/Sections/SafetyTips.js";
import AboutUs from "./components/Sections/AboutUs.js";
import "./App.css";
import AuthForm from "./components/Registration/AuthForm.js";
import { AuthProvider } from "./components/Registration/AuthContext.js";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ChooseInterests from "./components/ChooseInterests.js";
import HomeSection from "./components/Sections/HomeSection.js";
import { useEffect } from "react";
import pic from "./components/icon.png";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import LikesList from "./components/LikesPage.js";
import AttractionDetail from "./components/ContentBasedRec/AttractionDetail.js";
import CityAttractions from "./components/Destinations/CityAttractions.js";
import Profile from "./components/Registration/Profile.js";

function App() {
  useEffect(() => {
    document.title = "EGYVENTURE";
    document.querySelector("link[rel='icon']").href = pic;
  }, []);
  return (
    <div className="App d-flex flex-column min-vh-100">
      <AuthProvider>
        <Header />

        <main className="flex-grow-1">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <section id="home">
                    <HomeSection />
                  </section>
                  <section id="destinations">
                    <Destinations />
                  </section>

                  <section id="about">
                    <AboutUs />
                  </section>
                </>
              }
            />

            <Route path="/authentication" element={<AuthForm />} />
            <Route path="/chooseinterests" element={<ChooseInterests />} />
            <Route path="/homepage" element={<Home />} />
            <Route path="/safetytips" element={<SafetyTips />} />
            <Route path="/likes" element={<LikesList />} />
            <Route path="/attractions/:id" element={<AttractionDetail />} />
            <Route path="/attractions" element={<CityAttractions />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </AuthProvider>
    </div>
  );
}

export default App;
