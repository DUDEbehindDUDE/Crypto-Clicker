import { useContext } from "react";
import { Bitcoins, OwnedItems } from "../App.tsx";
import React from "react";
import ItemButton from "./ItemButton.tsx";
import StoreItemTooltip from "../tooltip/StoreItemTooltip.tsx";
import { format } from "../util/format.ts";

// Renders overclocks/upgrades for the selected system
function SystemUpgrades({ selected, buyItem, calcItemPrice }) {
  const { ownedItems } = useContext(OwnedItems);
  const { bitcoins } = useContext(Bitcoins);

  const priceClass = (item) =>
    bitcoins >= calcItemPrice(item)
      ? "incomeModifierPositive"
      : "incomeModifierNegative";

  function getLevel(item) {
    let level;
    switch (item) {
      case "cpu":
        level = ownedItems.systems[selected].cpuLevel;
        break;
      case "gpu":
        level = ownedItems.systems[selected].gpuLevel;
        break;
      case "ram":
        level = ownedItems.systems[selected].ram;
        break;
      default:
        throw new Error(`${item} is not a valid item`);
    }
    return level;
  }

  const buttonDescriptors = (item) => {
    // we don't need to display anything for RAM
    // since the amount owned is on display already
    if (item === "ram") return [];
    return [{ text: `Overclocks: ${getLevel(item)}`, class: "default" }];
  };

  const ownedText = (item) => {
    const itemText = item === "ram" ? "Upgrade" : "Overclock";
    return (
      <span className={priceClass(item)}>
        Purchase {itemText} for {calcItemPrice(item, true)} btc
      </span>
    );
  };

  // If no system has been selected yet, display placeholder/hint text
  if (selected === null) {
    return (
      <div className="systemUpgrades">
        <h3>Upgrades</h3>
        <p className="noUpgrades">Buy and select a system to view upgrades!</p>
      </div>
    );
  }

  // Display upgrades
  return (
    <div className="systemUpgrades">
      <h3>Upgrades for {selected}</h3>
      <StoreItemTooltip
        // GPU upgrade button
        element={
          <ItemButton
            onClick={() => buyItem("gpu")}
            object={{
              descriptors: buttonDescriptors("gpu"),
              title: ownedItems.systems[selected].items.gpu.name,
              type: "GPU",
            }}
            ownedText={ownedText("gpu")}
          />
        }
        mainItem={{
          title: ownedItems.systems[selected].items.gpu.name,
          desc: ownedItems.systems[selected].items.gpu.desc,
        }}
        additionalContent={[
          `Each overclock increases the BPS (Bitcoin per second) produced by the system by ${ownedItems.systems[selected].baseBps} btc`,
          `Currently overclocked ${getLevel(
            "gpu"
          )} time(s), resulting in +${format(
            getLevel("gpu") * ownedItems.systems[selected].baseBps
          )} BPS (${getLevel("gpu")}x increase)`,
        ]}
      />
      <StoreItemTooltip
        // CPU upgrade button
        element={
          <ItemButton
            onClick={() => buyItem("cpu")}
            object={{
              descriptors: buttonDescriptors("cpu"),
              title: ownedItems.systems[selected].items.cpu.name,
              type: "CPU",
            }}
            ownedText={ownedText("cpu")}
          />
        }
        mainItem={{
          title: ownedItems.systems[selected].items.cpu.name,
          desc: ownedItems.systems[selected].items.cpu.desc,
        }}
        additionalContent={[
          `Each overclock doubles the production of the system`,
          getLevel("cpu") === 0
            ? "Not yet overclocked, resulting in no production boost"
            : `Currently overclocked ${getLevel(
                "cpu"
              )} time(s), resulting in a ${
                2 ** getLevel("cpu")
              }x production boost`,
        ]}
      />
      <StoreItemTooltip
        // RAM upgrade button
        element={
          <ItemButton
            onClick={() => buyItem("ram")}
            object={{
              descriptors: buttonDescriptors("ram"),
              title: `${getLevel("ram")} GB`,
              type: "RAM",
            }}
            ownedText={ownedText("ram")}
          />
        }
        mainItem={{
          title: getLevel("ram") + " GB",
          desc: "It's random (haha get it because it stands for RANDOM Access Memory?!?)",
        }}
        additionalContent={[
          "Each gigabyte of RAM increases the clicking power by 1 Bitcoin per click",
          getLevel("ram") === 1
            ? "Not yet upgraded, resulting in no additional clicking power"
            : `Currently at ${getLevel("ram")} GB, resulting in +${getLevel(
                "ram"
              )} Bitcoin per click`,
        ]}
      />
    </div>
  );
}

export default SystemUpgrades;