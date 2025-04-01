import React from "react";
import AttractionsSlider from "./AttractionSlider";

const MustSeeAttractions = () => {
  return (
    <AttractionsSlider
      title="Must See Attractions"
      fetchUrl="http://127.0.0.1:8000/must_see/"
    />
  );
};

export default MustSeeAttractions;
