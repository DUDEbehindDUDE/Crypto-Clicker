import React from "react";
import DescriptionTooltip from "../tooltip/DescriptionTooltip.tsx";
import { format } from "../util/format.ts";

// Bitcoin and bps counter
function MainCounters({ total, bps }) {
  // Format total bitcoins counter
  total = format(total, true, false);

  // Format bps counter
  bps = format(bps);

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
