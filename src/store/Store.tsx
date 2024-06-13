import React, { useContext, useState } from "react";
import Systems from "./Systems.tsx";
import SystemUpgrades from "./SystemUpgrades.tsx";
import { Bitcoins, OwnedItems } from "../App.tsx";

// Everything you can buy is part of this component
function Store() {
  const { bitcoins, setBitcoins } = useContext(Bitcoins);
  const { ownedItems, setOwnedItems } = useContext(OwnedItems);
  const [selectedSystem, setSelectedSystem] = useState(null);
  // Buys a system if you can afford it
  function buySystem(price, name, properties) {
    // check if you can actually buy it
    if (price > bitcoins) return;

    // get system properties
    let newOwnedItems = ownedItems;
    newOwnedItems.hasChange = true;
    newOwnedItems.systems[name] = properties;
    newOwnedItems.systems[name].cpuLevel = 0;
    newOwnedItems.systems[name].gpuLevel = 0;
    newOwnedItems.systems[name].ram = 1;
    setBitcoins(bitcoins - price);
    setOwnedItems(newOwnedItems);
  }

  // Buys an overclock if you can afford it
  function buyOverclock(item) {
    if (selectedSystem === null) {
      throw "Selected system can't be null!";
    }

    // Check price
    const price = calcItemPrice(item, false, selectedSystem);
    if (price > bitcoins) return;

    // Increase level of item
    let newOwnedItems = ownedItems;
    newOwnedItems.hasChange = true;
    switch (item) {
      case "ram":
        newOwnedItems.systems[selectedSystem].ram *= 2;
        break;
      case "cpu":
        newOwnedItems.systems[selectedSystem].cpuLevel++;
        break;
      case "gpu":
        newOwnedItems.systems[selectedSystem].gpuLevel++;
        break;
      default:
        throw new Error("Item value " + item + " is not valid");
    }

    // Buy item
    setBitcoins(bitcoins - price);
    setOwnedItems(newOwnedItems);

    // Play a sound when item is bought
    const randomPlaybackRate = Math.random() / 10 + 0.75;
    const clickAudio = new Audio("ka-ching.wav");
    clickAudio.playbackRate = randomPlaybackRate;
    clickAudio.preservesPitch = false;
    clickAudio.play();
  }

  // Calculates the price of an item
  function calcItemPrice(
    item: string,
    formatted = false,
    system: number | null = selectedSystem
  ) {
    let level;
    let priceModifier;
    let price;

    if (system === null) {
      throw "system can't be null!";
    }
    
    // Calculate the price of the item based on what the item is
    switch (item) {
      case "cpu":
        priceModifier = 30 * ownedItems.systems[system].priceModifier;
        level = ownedItems.systems[system].cpuLevel;
        // each upgrade increases cost by 8x, and the base price is 30% of priceModifier
        price = priceModifier * 0.3 * 8 ** level;
        break;
      case "gpu":
        priceModifier = ownedItems.systems[system].priceModifier;
        level = ownedItems.systems[system].gpuLevel;
        price = priceModifier * 1.15 ** level; // each upgrade increases cost by 15%
        break;
      case "ram":
        priceModifier = ownedItems.systems[system].priceModifier;
        level = ownedItems.systems[system].ram;
        // each GB of ram increases cost by 60%, and ram is 5x of priceModifier
        price = priceModifier * 5 * 1.6 ** level;
        break;
      default:
        throw new Error(`Invalid item ${item}`);
    }

    price = Math.round(price); // no decimals
    if (!formatted) {
      return price;
    }

    // Format price so it looks pretty ✨✨
    if (price >= 1_000_000) {
      // for numbers bigger than 1 mil, format it like:
      // 123.456 million (3 decimal places + word)
      price = Intl.NumberFormat("en", {
        notation: "compact",
        compactDisplay: "long",
        minimumFractionDigits: 3,
      }).format(price);
    } else {
      // For numbers less than 1 mil, we can just format it with
      // commas (12,345.67). "12.345 thousand" would be really stupid
      price = Intl.NumberFormat("en", {}).format(price);
    }

    return price;
  }

  // Checks if a system has upgrades available
  function systemHasUpgrades(system) {
    if (bitcoins >= calcItemPrice("cpu", false, system)) {
      return true;
    } else if (bitcoins >= calcItemPrice("gpu", false, system)) {
      return true;
    } else if (bitcoins >= calcItemPrice("ram", false, system)) {
      return true;
    }
    return false;
  }

  // Calculates how many bps a system is producing
  function calcSystemBps(system) {
    system = ownedItems.systems[system];
    let systemBps = (system.gpuLevel + 1) * system.baseBps;
    systemBps *= 2 ** system.cpuLevel;
    return systemBps;
  }

  return (
    <aside className="store">
      <Systems
        setSelected={setSelectedSystem}
        buySystem={buySystem}
        ownedItems={ownedItems}
        calcSystemBps={calcSystemBps}
        systemHasUpgrades={systemHasUpgrades}
      />
      <SystemUpgrades
        selected={selectedSystem}
        buyItem={buyOverclock}
        calcItemPrice={calcItemPrice}
      />
    </aside>
  );
}

export default Store;