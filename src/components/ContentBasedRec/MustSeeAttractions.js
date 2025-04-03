import React from "react";
import AttractionsSlider from "./AttractionSlider";

import { useAuth } from "../Registration/AuthContext";
const MustSeeAttractions = () => {
  const { user } = useAuth();
  const userId = user?.id;
  return (
    <AttractionsSlider
      title="Must See Attractions"
      fetchUrl="http://127.0.0.1:8000/must_see/"
      userId={userId}
    />
  );
};

export default MustSeeAttractions;
