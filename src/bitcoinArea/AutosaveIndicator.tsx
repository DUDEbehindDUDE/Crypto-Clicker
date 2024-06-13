import { useEffect, useState } from "react";
import DescriptionTooltip from "../tooltip/DescriptionTooltip.tsx";
import { IAutosaveIndicator } from "../types/interface/IAutosaveIndicator";
import React from "react";

function AutosaveIndicator({ prevSave, onClick }: IAutosaveIndicator) {
  const [timeSinceSave, setTimeSinceSave] = useState(0);

  const element = (
    <div className="autosaveIndicator" onMouseDown={onClick}>
      <span className="material-symbols-outlined">save</span>
    </div>
  );

  const addContent = [
    "Your progress is autosaved every 15 seconds.",
    "You can still manually save by pressing this icon.",
    `Last save was ${timeSinceSave} seconds ago.`,
  ];

  // check the seconds
  useEffect(() => {
    function newCurrentTime() {
      const difference = (Date.now() - prevSave.valueOf()) / 1000;
      setTimeSinceSave(Math.floor(difference));
    }
    const timeInterval = setInterval(newCurrentTime, 250); // checking 4 times a second incase lag or something idk
    return () => clearInterval(timeInterval);
  }, [timeSinceSave, prevSave]);

  return (
    <DescriptionTooltip
      title="Autosave"
      additionalContent={addContent}
      element={element}
    />
  );
}

export default AutosaveIndicator;
