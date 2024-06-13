import { useState, useEffect, createContext } from "react";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/shift-away.css";
import "./App.css";
import React from "react";
import MainCounters from "./counters/MainCounters.tsx"
import Bitcoin from "./bitcoin/Bitcoin.tsx";
import Store from "./store/Store.tsx";
import SecondaryCounters from "./counters/SecondaryCounters.tsx";

export const Bitcoins = createContext<any | number>(0);
export const Bps = createContext<any | number | null>(null);
export const OwnedItems = createContext<any | number | null>(null);

// Entry point for code
function App() {
  const [bitcoins, setBitcoins] = useState(0);
  const [bps, setBps] = useState(0); // bitcoin per second
  const [bitcoinPerClick, setBitcoinPerClick] = useState<number>(1);
  const [ownedItems, setOwnedItems] = useState({
    // This is an object containing all the items the player owns and what upgrades they have purchased
    hasChange: true,
    systems: {},
    upgrades: [],
  });

  // Add 1/10th of the bps to total bitcoin every 100ms
  useEffect(() => {
    const bpsInterval = setInterval(handleBps, 100);
    return () => {
      clearInterval(bpsInterval);
    };

    function handleBps() {
      setBitcoins((bitcoins) => bitcoins + bps / 10);
    }
  }, [bps]);

  // Recalculate BPS and bitcoin per click when owned items changes
  // note: set ownedItems.hasChange to true, otherwise it won't update
  useEffect(() => {
    const newBps = calculateBps(ownedItems.systems);
    const newBitcoinPerClick = calculateBtcPerClick(ownedItems.systems);
    const resetChanges = ownedItems;
    resetChanges.hasChange = false;
    setOwnedItems(resetChanges);
    setBps(newBps);
    setBitcoinPerClick(newBitcoinPerClick);
  }, [ownedItems.hasChange, ownedItems]);

  // Calculates the bps every time owned items change
  function calculateBps(systems) {
    console.log("recalculating BPS");
    let bps = 0;
    for (const system in systems) {
      const currentSystem = systems[system];
      let systemBps = (currentSystem.gpuLevel + 1) * currentSystem.baseBps;
      systemBps *= 2 ** currentSystem.cpuLevel;
      bps += systemBps;
    }
    return bps;
  }

  // Calculates how many bitcoin should be earned each click each time
  // ownedItems changes
  function calculateBtcPerClick(systems) {
    let bpc = 0;
    for (const system in systems) {
      const currentSystem = systems[system];
      const systemBpc = currentSystem.ram;
      if (systemBpc !== 1) bpc += systemBpc;
    }
    if (bpc < 1) bpc = 1;

    return bpc;
  }

  return (
    // All the providers are to prevent prop drilling. I haven't taken
    // the time to do proper state management but this works for now and
    // it's better than prop drilling
    <Bitcoins.Provider value={{ bitcoins, setBitcoins }}>
      <Bps.Provider value={{ bps }}>
        <OwnedItems.Provider value={{ ownedItems, setOwnedItems }}>
          <div className="mainContent">
            <MainCounters total={bitcoins} bps={bps} />
            <Bitcoin bitcoinPerClick={bitcoinPerClick} />
            <SecondaryCounters bpc={bitcoinPerClick} />
          </div>
          <Store />
        </OwnedItems.Provider>
      </Bps.Provider>
    </Bitcoins.Provider>
  );
}

export default App;
