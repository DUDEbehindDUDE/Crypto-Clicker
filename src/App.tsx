import { useState, useEffect, createContext, useRef } from "react";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/shift-away.css";
import "./App.css";
import Cookies from "js-cookie";
import React from "react";
import MainCounters from "./bitcoinArea/MainCounters.tsx";
import Bitcoin from "./bitcoinArea/Bitcoin.tsx";
import Store from "./store/Store.tsx";
import SecondaryCounters from "./bitcoinArea/SecondaryCounters.tsx";
import AutosaveIndicator from "./bitcoinArea/AutosaveIndicator.tsx";

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
    hasChange: false,
    systems: {},
    upgrades: [],
  });
  const [prevSaveTime, setPrevSaveTime] = useState(new Date());

  // UseRefs to keep track of autosave data
  const hasLoadedRef = useRef(false);
  const bitcoinsRef = useRef(bitcoins);
  const ownedItemsRef = useRef(ownedItems);
  
  // UseRef to keep track of bps
  const lastBitcoinUpdate = useRef(new Date());

  // Load autosave data
  useEffect(() => {
    if (!hasLoadedRef.current) {
      console.log("Loading Autosave Data");
      hasLoadedRef.current = true;

      const bitcoinsCookie = Cookies.get("bitcoins") as string | undefined;
      const ownedItemsCookie = Cookies.get("ownedItems") as string | undefined;

      if (bitcoinsCookie !== undefined && typeof bitcoinsCookie === "string") {
        console.log(bitcoinsCookie);
        setBitcoins(Number(bitcoinsCookie));
      }

      if (
        ownedItemsCookie !== undefined &&
        typeof ownedItemsCookie === "string"
      ) {
        console.log(ownedItemsCookie);
        const parsed = JSON.parse(ownedItemsCookie);
        parsed.hasChange = true;
        console.log(parsed);
        setOwnedItems({ ...parsed });
        console.log("ownedItems:");
        console.log(ownedItems);
        // ownedItemsRecalculations();
      }
      console.log("Autosave Data Loaded!");
    }
  }, []);

  // Update bitcoinsRef on bitcoins change
  useEffect(() => {
    bitcoinsRef.current = bitcoins;
  }, [bitcoins]);

  // Add bitcoins based on bps
  useEffect(() => {
    const difference = (Date.now() - lastBitcoinUpdate.current.valueOf()) / 1000;
    setBitcoins((bitcoins) => bitcoins + bps * difference);
    lastBitcoinUpdate.current = new Date();
  }, [bps, bitcoins]);

  // Autosave items to cookies every 15 secs
  function doAutosave() {
    // set data to expire 10 years from now
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 10);

    // get items from ref, so they will be autosaved properly
    Cookies.set("bitcoins", bitcoinsRef.current, { expires: expiryDate });
    Cookies.set("ownedItems", JSON.stringify(ownedItemsRef.current), {
      expires: expiryDate,
    });

    console.log("Autosave");
    console.log(Cookies.get("bitcoins"));
    console.log(JSON.parse(Cookies.get("ownedItems")));
    setPrevSaveTime(new Date());
  }

  useEffect(() => {
    const autosaveInterval = setInterval(doAutosave, 1000 * 15); // 15 secs
    return () => clearInterval(autosaveInterval);
  }, []);

  // Recalculate BPS and bitcoin per click when owned items changes
  // note: set ownedItems.hasChange to true, otherwise it won't update
  function ownedItemsRecalculations() {
    if (ownedItems.hasChange === false) return;

    const newBps = calculateBps(ownedItems.systems);
    const newBitcoinPerClick = calculateBtcPerClick(ownedItems.systems);
    const resetChanges = {
      ...ownedItems,
      hasChange: false,
    };
    setOwnedItems(resetChanges);
    setBps(newBps);
    setBitcoinPerClick(newBitcoinPerClick);

    // update ownedItemsRef, to use in autosave data
    ownedItemsRef.current = ownedItems;
  }
  useEffect(() => {
    ownedItemsRecalculations();
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
            <AutosaveIndicator prevSave={prevSaveTime} onClick={doAutosave} />
            <SecondaryCounters bpc={bitcoinPerClick} />
          </div>
          <Store />
        </OwnedItems.Provider>
      </Bps.Provider>
    </Bitcoins.Provider>
  );
}

export default App;
