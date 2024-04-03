import { useState, useEffect, createContext, useContext } from "react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/shift-away.css";
import bitcoinImg from "./media/bitcoin.png";
import "./App.css";

const Bitcoins = createContext(0);
const Bps = createContext();
const OwnedItems = createContext();

/*
 * Note - this project was created in ReactJS, so all functions that start with uppercase letters
 * are react components. To run this code, run react's create-react-app script and populate App.js
 * with this code.
 *
 * I know this code is an eye-soar, but this is what happens when you have to submit code as a .pdf
 * Many sprites contained in this project were generated with the help of Dall-E and/or Midjourney
 */

// Entry point for code
function App() {
  const [bitcoins, setBitcoins] = useState(0);
  const [bps, setBps] = useState(0); // bitcoin per second
  const [bitcoinPerClick, setBitcoinPerClick] = useState(1);
  const [ownedItems, setOwnedItems] = useState({
    // This is an object containing all the items the player owns and what upgrades they have purchased
    hasChange: true,
    systems: {
      // example: {
      //   baseBps: 0.1,
      //   priceModifier: 1,
      //   cpuLevel: 0,
      //   gpuLevel: 0,
      //   ram: 2,
      // },
    },
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
  // ownedIte,s changes
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
          <div class="mainContent">
            <MainCounters total={bitcoins} bps={bps} />
            <Bitcoin bitcoinPerClick={bitcoinPerClick} />
          </div>
          <Store />
        </OwnedItems.Provider>
      </Bps.Provider>
    </Bitcoins.Provider>
  );
}

// The Bitcoin (the one you can click)
function Bitcoin({ bitcoinPerClick }) {
  const { setBitcoins } = useContext(Bitcoins);

  // Do things when the cookie is clicked (great comment I know)
  function onClick() {
    // add bitcoins based on current bitcoinsPerClick
    setBitcoins((current) => current + bitcoinPerClick);

    // Generate/play sounds
    const randomPlaybackRate = Math.random() / 10 + 0.75;
    const clickAudio = new Audio("click.wav");
    clickAudio.playbackRate = randomPlaybackRate;
    clickAudio.preservesPitch = false;
    clickAudio.play();
  }

  return (
    <img
      class="bitcoin"
      alt="bitcoin"
      draggable="false"
      src={bitcoinImg}
      onMouseDown={onClick} // <-- we are using onMouseDown instead of onClick
    /> //                      because onClick doesn't work well with coin wobble
  );
}

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

  return (
    <div class="textWrapper">
      <h1 class="totalBitcoin">Bitcoin: {total}</h1>
      <p class="bitcoinPerSecond">per second: {bps}</p>
    </div>
  );
}

// Everything you can buy is part of this component
function Store() {
  const { bitcoins, setBitcoins } = useContext(Bitcoins);
  const { ownedItems, setOwnedItems } = useContext(OwnedItems);
  const [selectedSystem, setSelectedSystem] = useState(null); // string, like "Your Grandma's Old PC"

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
  function calcItemPrice(item, formatted = false, system = selectedSystem) {
    let level;
    let priceModifier;
    let price;

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
    <aside class="store">
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
        ownedItems={ownedItems}
        calcItemPrice={calcItemPrice}
      />
    </aside>
  );
}

// Systems (things u can buy)
function Systems({
  setSelected,
  buySystem,
  ownedItems,
  calcSystemBps,
  systemHasUpgrades,
}) {
  // Variables
  const { bitcoins } = useContext(Bitcoins);

  // This is the data for all of the systems that you can buy.
  const systems = [
    {
      name: "Your Grandma's Old PC",
      desc: "She never learned how to use it, so she's letting you have it for cheap.",
      unlocksAt: 0,
      special: null,
      price: 10,
      priceModifier: 10,
      baseBps: 0.1,
      items: {
        cpu: {
          name: "Intel® Celeron® J3355 2.0GHz 2 Core",
          desc: "Perfect for basic tasks like checking email and watching cat videos.",
        },
        gpu: {
          name: "Intel® HD Graphics 500",
          desc: "I don't think it can run crisis",
        },
      },
    },
    {
      name: "Dell Optiplex 3050 SFF Desktop PC",
      desc: "Official computer of offices everywhere",
      unlocksAt: 50,
      special: null,
      price: 165,
      priceModifier: 165,
      baseBps: 2,
      items: {
        cpu: {
          name: "Intel® Core™ i5-6500 3.2GHz 4 Core",
          desc: "Pulled straight from the Amazon listing",
        },
        gpu: {
          name: "Intel® HD Graphics 530",
          desc: "Runs Minecraft at at least 30fps",
        },
      },
    },
    {
      name: "AliExpress Gaming PC",
      desc: "The Chinese might be spying on you, but it'll at least mine some coins (maybe??)",
      unlocksAt: 800,
      special: null,
      price: 1250,
      priceModifier: 1250,
      baseBps: 16,
      items: {
        cpu: {
          name: "Intel i-8 Cores",
          desc: "There are definitely less than 8 cores",
        },
        gpu: {
          name: "RTX 2190 Ti",
          desc: "Is this even real?",
        },
      },
    },
    {
      name: "Corsair RGB Mid-Tower",
      desc: "Includes RGB for increased performance",
      unlocksAt: 200,
      special: null,
      price: 12500,
      priceModifier: 5500,
      baseBps: 65,
      items: {
        cpu: {
          name: "Ryzen 5 2600",
          desc: "A solid CPU for multitasking and gaming. Unfortunately, not made of RGB.",
        },
        gpu: {
          name: "GTX 1060 Ti",
          desc: "A solid GPU for most gamers. The fans glow with RGB, empowering the it with more gaming (and mining) capabilities.",
        },
      },
    },
    {
      name: "Crypto Mining Rig",
      desc: "Has slots for multiple GPUs, so it can mine more coins.",
      unlocksAt: 10000,
      special: null,
      price: 150000,
      priceModifier: 16500,
      baseBps: 250,
      items: {
        cpu: {
          name: "2x Intel Xeon E5-1650",
          desc: "Mid-range workstation CPUs optimized for workstation loads (e.g. mining)",
        },
        gpu: {
          name: "4x RTX 2070 Super",
          desc: "The 'Super' stands for 'SUPER-goodatminingcrypto'!!!!!! And yes, the 4 GPUs all have RGB",
        },
      },
    },
  ];

  // returns the css class based on price
  const buyClass = (price) =>
    price > bitcoins ? "incomeModifierNegative" : "incomeModifierPositive";

  // When you click on system, try to buy it or, if owned, switch to the system
  function onSystemClick(index) {
    const system = systems[index];

    const owned = () => {
      for (const ownedSystem in ownedItems.systems) {
        if (ownedSystem === system.name) return true;
      }
      return false;
    };

    if (owned()) {
      setSelected(system.name);
      return;
    }

    const price = systems[index].price;
    buySystem(price, system.name, system);

    if (owned()) {
      setSelected(system.name);
      const randomPlaybackRate = Math.random() / 10 + 0.75;
      const clickAudio = new Audio("ka-ching.wav");
      clickAudio.playbackRate = randomPlaybackRate;
      clickAudio.preservesPitch = false;
      clickAudio.play();
    }
  }

  // Returns some system-specific descriptors based on the system's index
  const systemInfoDescriptors = (index, owned, isTooltip = false) => {
    const name = systems[index].name;
    let descriptors = [];
    if (!owned) {
      const price = systems[index].price;
      if (buyClass(price) === "incomeModifierPositive") {
        descriptors.push({
          text: "Available",
          class: "incomeModifierPositive",
        });
      }
      if (isTooltip) {
        descriptors.push({
          text: `Cost: ${format(price)} btc`,
          class: buyClass(price),
        });
      }
      return descriptors;
    }

    const bps = calcSystemBps(name);
    descriptors.push({ text: "Owned", class: "default" });
    if (systemHasUpgrades(name)) {
      descriptors.push({
        text: "Overclocks Available!",
        class: "incomeModifierPositive",
      });
    }
    if (isTooltip) {
      descriptors.push({
        text: `BPS: ${format(bps)}`,
        class: "incomeModifierPositive",
      });
    }
    return descriptors;
  };

  // Format numbers so they looks pretty ✨✨
  function format(number) {
    if (number >= 1_000_000) {
      // for numbers bigger than 1 mil, format it like:
      // 23.456 million (3 decimal places + word)
      number = Intl.NumberFormat("en", {
        notation: "compact",
        compactDisplay: "long",
        minimumFractionDigits: 3,
      }).format(number);
    } else {
      // For numbers less than 1 mil, we can just format it with
      // commas (12,345.67). "12.345 thousand" would be really stupid
      number = Intl.NumberFormat("en", {}).format(number);
    }

    return number;
  }

  // Renders all systems. Currently, all systems are by default available, but
  // they might become available based on price (like cookie clicker) later on
  // (if this comment is still here then I never implemented that)
  const availableSystems = systems.map((system, index) => {
    const owned = ownedItems.systems[system.name] !== undefined;
    const tooltip = {
      descriptors: systemInfoDescriptors(index, owned, true),
      title: system.name,
      desc: system.desc,
    };

    // render button
    const button = (
      <ItemButton
        onClick={() => onSystemClick(index)}
        ownedText={
          owned ? ( // the {" "} is literally just a space, if I don't have that there there is no space
            <>
              Producing{" "}
              {<span class={""}>{format(calcSystemBps(system.name))}</span>} BPS
              · Manage system {">"}
            </> // and the > is in brackets because otherwise, it thinks it's an HTML tag or whatever
          ) : (
            <span class={buyClass(systems[index].price)}>
              Purchase system for {format(systems[index].price)} btc
            </span>
          )
        }
        object={{
          descriptors: systemInfoDescriptors(index, owned),
          title: system.name,
          type: "System",
        }}
      />
    );

    // adds some production stats if the item is owned. Else, it doesn't
    const addContent = owned
      ? [
          `${ownedItems.systems[system.name].gpuLevel} overclock(s) on GPU`,
          `${ownedItems.systems[system.name].cpuLevel} overclock(s) on CPU`,
          `${ownedItems.systems[system.name].ram} GB of RAM`,
        ]
      : [];

    return (
      <TooltipItem
        key={system.name}
        element={button}
        mainItem={tooltip}
        additionalContent={addContent}
      />
    );
  });

  return (
    <div class="systems">
      <h3>Systems</h3>
      {availableSystems}
    </div>
  );
}

// Renders overclocks/upgrades for the selected system
function SystemUpgrades({ selected, buyItem, calcItemPrice }) {
  const { ownedItems } = useContext(OwnedItems);
  const { bitcoins } = useContext(Bitcoins);

  function format(number) {
    // TODO -- figure out how global functions work in react so I don't have to copy paste this in every prop I use it in
    if (number >= 1_000_000) {
      // for numbers bigger than 1 mil, format it like:
      // 23.456 million (3 decimal places + word)
      number = Intl.NumberFormat("en", {
        notation: "compact",
        compactDisplay: "long",
        minimumFractionDigits: 3,
      }).format(number);
    } else {
      // For numbers less than 1 mil, we can just format it with
      // commas (12,345.67). "12.345 thousand" would be really stupid
      number = Intl.NumberFormat("en", {}).format(number);
    }

    return number;
  }

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

  // example: (wish I used typescript now :P)
  // exampleOwnedItems = {
  //   systems: {
  //     example: {
  //       baseBps: 0.1,
  //       priceModifier: 1,
  //       cpuLevel: 0,
  //       gpuLevel: 0,
  //       ram: 2,
  //     },
  //   },
  //   upgrades: [],
  // };

  const buttonDescriptors = (item) => {
    // we don't need to display anything for RAM
    // since the amount owned is on display already
    if (item === "ram") return [];
    return [{ text: `Overclocks: ${getLevel(item)}`, class: "default" }];
  };

  const ownedText = (item) => {
    return (
      <span class={priceClass(item)}>
        Purchase overclock for {calcItemPrice(item, true)} btc
      </span>
    );
  };

  // If no system has been selected yet, display placeholder/hint text
  if (selected === null) {
    return (
      <div class="systemUpgrades">
        <h3>Upgrades</h3>
        <p class="noUpgrades">Buy and select a system to view upgrades!</p>
      </div>
    );
  }

  // Display upgrades
  return (
    <div class="systemUpgrades">
      <h3>Upgrades for {selected}</h3>
      <TooltipItem
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
          descriptors: [],
          title: ownedItems.systems[selected].items.gpu.name,
          desc: ownedItems.systems[selected].items.gpu.desc,
        }}
        additionalContent={[
          `Each overclock increases the BPS (bitcoin per second) produced by the system by ${ownedItems.systems[selected].baseBps} btc`,
          `Currently overclocked ${getLevel(
            "gpu"
          )} time(s), resulting in +${format(
            getLevel("gpu") * ownedItems.systems[selected].baseBps
          )} bps (${getLevel("gpu")}x increase)`,
        ]}
      />
      <TooltipItem
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
          descriptors: [],
          title: ownedItems.systems[selected].items.cpu.name,
          desc: ownedItems.systems[selected].items.cpu.desc,
        }}
        additionalContent={[
          `Each overclock doubles the production of the system`,
          `Currently overclocked ${getLevel("cpu")} time(s), resulting in ${
            2 ** getLevel("cpu") * 100
          }% production`,
        ]}
      />
      <TooltipItem
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
          descriptors: [],
          title: getLevel("ram") + " GB",
          desc: "It's random (haha get it because it stands for RANDOM Access Memory?!?)",
        }}
        additionalContent={[
          "Each GB of RAM increases the amount of bitcoin earned per click by 1",
          getLevel("ram") === 1
            ? "Not yet upgraded, resulting in no additional bitcoin per click"
            : `Currently at ${getLevel("ram")}GB, resulting in +${getLevel(
                "ram"
              )} bitcoin per click`,
        ]}
      />
    </div>
  );
}

// These are the buttons that you can click to buy/select systems/upgrades
function ItemButton({
  object,
  onClick,
  ownedText = undefined, // if supplied, renders the text underneath
}) {
  const descriptors = object.descriptors.map((descriptor, index) => (
    <span
      key={`${descriptor.text}${index}`}
      class={"descriptor " + descriptor.class}
    >
      {descriptor.text}
    </span>
  ));
  return (
    <button onClick={onClick}>
      <div class="descriptors">{descriptors}</div>
      <p class="buttonTitle">{object.title}</p>
      <p class="buttonType">{object.type}</p>
      <p class="manage">{ownedText}</p>
    </button>
  );
}

// Renders a tooltip over the provided element when the element is hovered over
function TooltipItem({ element, mainItem, additionalContent = [] }) {
  /* Examples
   * mainItem = {
   *   descriptors: [
   *     { text: "Owned", class: "" },
   *     { text: "BPS: 5", class: "" },
   *   ],
   *   title: "Your Grandma's Old PC",
   *   desc: "She never learned how to use it, so she's letting you have it for cheap",
   * };
   * additionalContent = [<array of strings>]; */

  // Format tooltip content
  const tooltip = () => {
    const descriptors = mainItem.descriptors.map((descriptor) => (
      <span
        key={`tooltip${descriptor.text}${mainItem.title}`}
        class={"descriptor " + descriptor.class}
      >
        {descriptor.text}
      </span>
    ));
    const title = mainItem.title;
    const desc = `"${mainItem.desc}"`;
    const separator =
      additionalContent.length > 0 ? <div class="separator" /> : null;
    const _additionalContent = additionalContent.map((item) => {
      return <li key={`tooltipAddItem${mainItem.title}${item}`}>{item}</li>;
    });
    return (
      <>
        <div class="tooltipDescriptors">{descriptors}</div>
        <div class="tooltipMainContent">
          <p class="tooltipTitle">{title}</p>
          <aside class="tooltipDesc">
            <p class="desc">{desc}</p>
          </aside>
        </div>
        {separator}
        <ul class="addContent">{_additionalContent}</ul>
      </>
    );
  };

  return (
    <Tippy
      className="tooltip"
      placement="left"
      arrow={false}
      animation={"shift-away"}
      content={tooltip()}
    >
      <span>{element}</span>
    </Tippy>
  );
}

// Global Upgrades -- this is old code (not used anymore) and will probably get removed if I don't forget
// If this isn't removed it is because I plan on implementing this system on my own time after the AP exam
function Upgrade({ name, price, priceMultiplier, bpsPerUpgrade, maxLevel }) {
  const { bitcoins, setBitcoins } = useContext(Bitcoins);
  const { ownedItems, setOwnedItems } = useContext(OwnedItems);
  const [level, setLevel] = useState(1);
  const [cost, setCost] = useState(price);
  const [locked, setLocked] = useState(false);

  function upgrade() {
    if (bitcoins < cost) return;
    if (level >= maxLevel) {
      setLocked(true);
      return;
    }
    setBitcoins(bitcoins - cost);
    setLevel(level + 1);
    setCost(price * priceMultiplier * level);
    if (level >= maxLevel) setLocked(true);

    let newOwnedItems = ownedItems;
    newOwnedItems.upgrades.push({ bps: bpsPerUpgrade });
    newOwnedItems.hasChange = true;
    setOwnedItems(newOwnedItems);
  }

  function determineLocked() {
    if (locked === true) {
      return <p>Level: Max!</p>;
    } else {
      return (
        <>
          <p>Level: {level}</p>
          <p>Cost: {cost} btc</p>
        </>
      );
    }
  }
  return (
    <button class="upgrade" onClick={upgrade}>
      <p>{name}</p>
      {determineLocked()}
    </button>
  );
}

export default App;
