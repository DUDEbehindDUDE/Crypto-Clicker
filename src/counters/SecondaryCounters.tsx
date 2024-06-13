import React from "react";
import DescriptionTooltip from "../tooltip/DescriptionTooltip.tsx";

// Clicking Power Counter
function SecondaryCounters({ bpc }) {
  const element = (
    <div className="clickingPower">
      <p>Clicking Power: {bpc} Bitcoin per click</p>
      <span className="material-symbols-outlined">help</span>
    </div>
  );
  const addContent = [
    "Clicking Power represents how much Bitcoin you earn from each click.",
    "For example, if your clicking power was 2, you would earn 2 Bitcoin" +
      " each time you manually clicked the Bitcoin.",
    "To increase your clicking power, upgrade the RAM in your systems.",
  ];

  return (
    <DescriptionTooltip
      element={element}
      title={"Clicking Power"}
      additionalContent={addContent}
    />
  );
}

export default SecondaryCounters;