import React from "react";
import DescriptionTooltip from "../tooltip/DescriptionTooltip.tsx";

// Bitcoin and bps counter
function MainCounters({ total, bps }) {
  // Format total bitcoins counter
  total = Math.floor(total);
  if (total >= 1_000_000) {
    total = Intl.NumberFormat("en", {
      notation: "compact",
      compactDisplay: "long",
      minimumFractionDigits: 3,
    }).format(total);
  } else {
    total = Intl.NumberFormat("en", {}).format(total);
  }

  // Format bps counter
  bps = Math.round(bps * 10) / 10;
  if (bps >= 1_000_000) {
    bps = Intl.NumberFormat("en", {
      notation: "compact",
      compactDisplay: "long",
      minimumFractionDigits: 3,
    }).format(bps);
  } else {
    bps = Intl.NumberFormat("en", {}).format(bps);
  }

  const bpsCounter = (
    <div className="bpsCounter">
      <p className="bitcoinPerSecond">per second: {bps}</p>
      <span className="material-symbols-outlined">help</span>
    </div>
  );
  const bpsCounterAddContent = [
    "Bitcoin per second (BPS) represents how many Bitcoins you are passively" +
      " earning each second.",
    "BPS can be increased by purchasing systems and overclocks.",
    "You can view the BPS of each system in the bottom right of each card in" +
      " the systems panel.",
  ];

  return (
    <div className="textWrapper">
      <h1 className="totalBitcoin">Bitcoin: {total}</h1>
      <DescriptionTooltip
        element={bpsCounter}
        title={"Bitcoin per Second"}
        additionalContent={bpsCounterAddContent}
        placement="bottom"
      />
    </div>
  );
}

export default MainCounters;