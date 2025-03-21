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

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Header />

        <main>
          <Routes>
            {/* Home Route - Wrap all sections inside */}
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
                  <section id="safety">
                    <SafetyTips />
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
          </Routes>
        </main>
      </AuthProvider>
    </div>
  );
}

export default App;
