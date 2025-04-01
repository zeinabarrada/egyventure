import React from "react";
import AttractionsSlider from "./AttractionSlider";
import { useAuth } from "../Registration/AuthContext";

const Recommendations = () => {
  const { user } = useAuth();
  const userId = user?.id;

  return (
    <AttractionsSlider
      title="Recommended just for you"
      fetchUrl="http://127.0.0.1:8000/word2vec/"
      userId={userId}
    />
  );
};

export default Recommendations;
