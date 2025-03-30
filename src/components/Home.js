import React from "react";
import RecCards from "./ContentBasedRec/RecCards";
import MustSeeAttractions from "./ContentBasedRec/MustSeeAttractions";
export default function Home() {
  return (
    <div>
      <RecCards />
      <MustSeeAttractions />
    </div>
  );
}
