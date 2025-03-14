import Header from "./components/Header/Header.js";
import Home from "./components/Sections/Home.js";
import Destinations from "./components/Sections/Destinations.js";
import SafetyTips from "./components/Sections/SafetyTips.js";
import AboutUs from "./components/Sections/AboutUs.js";
import "./App.css";
import AuthForm from "./components/Registration/AuthForm.js";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ChooseInterests from "./components/ChooseInterests.js";

function App() {
  return (
    <div className="App">
      <Header />

      <main>
        <Routes>
          {/* Home Route - Wrap all sections inside */}
          <Route
            path="/"
            element={
              <>
                <section id="home">
                  <Home />
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

          <Route path="/login" element={<AuthForm />} />
          <Route path="/chooseinterests" element={<ChooseInterests />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
