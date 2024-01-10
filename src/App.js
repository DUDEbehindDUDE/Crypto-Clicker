import { useState, useEffect, createContext, useContext } from "react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
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
 * All sprites contained in this project were generated with the help of Dall-E and/or Midjourney
 */

// Entry point for code
function App() {
  const [bitcoins, setBitcoins] = useState(0);
  const [bps, setBps] = useState(0); // bitcoin per second
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
  }, [bps]);
  function handleBps() {
    setBitcoins((bitcoins) => bitcoins + bps / 10);
  }

  // Recalculate BPS when owned items changes
  // note: set ownedItems.hasChange to true, otherwise it won't update
  useEffect(() => {
    console.log("recalculating BPS");
    let newBps = 0;
    const systems = ownedItems.systems;

    for (const system in systems) {
      const currentSystem = systems[system];
      let systemBps = (currentSystem.gpuLevel + 1) * currentSystem.baseBps;
      systemBps *= currentSystem.cpuLevel + 1; // note: need to tune this later
      newBps += systemBps;
      // newCps += systemBps * (Math.log2(currentSystem.ram) - 1) ** 2;
    }
    const resetChanges = ownedItems;
    resetChanges.hasChange = false;
    setOwnedItems(resetChanges);
    setBps(newBps);
  }, [ownedItems.hasChange]);

  return (
    <Bitcoins.Provider value={{ bitcoins, setBitcoins }}>
      <Bps.Provider value={{ bps }}>
        <OwnedItems.Provider value={{ ownedItems, setOwnedItems }}>
          <div class="mainContent">
            <MainCounters total={bitcoins} bps={bps} />
            <Bitcoin />
          </div>
          <Store />
        </OwnedItems.Provider>
      </Bps.Provider>
    </Bitcoins.Provider>
  );
}

function Bitcoin() {
  // The coin
  const { setBitcoins } = useContext(Bitcoins);
  function onClick() {
    setBitcoins((bitcoins) => bitcoins + 1);
    const randomPlaybackRate = Math.random() / 10 + 0.75;
    const clickAudio = new Audio("click.wav");
    clickAudio.playbackRate = randomPlaybackRate;
    clickAudio.preservesPitch = false;
    clickAudio.play();
  }
  return (
    <img class="bitcoin" alt="bitcoin" src={bitcoinImg} onClick={onClick} />
  );
}

function MainCounters({ total, bps }) {
  // Bitcoin and bps counter
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

function Store() {
  // Everything you can buy is part of this component
  const { bitcoins, setBitcoins } = useContext(Bitcoins);
  const { ownedItems, setOwnedItems } = useContext(OwnedItems);
  const [upgradesAvailable, setUpgradesAvailable] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState(null); // string, like "Your Grandma's Old PC"

  function buySystem(price, name, properties) {
    // exampleProperties = {
    //   baseBps: 0.1,
    //   priceModifier: 1,
    // }
    if (price > bitcoins) return;

    let newOwnedItems = ownedItems;
    newOwnedItems.hasChange = true;
    newOwnedItems.systems[name] = properties;
    newOwnedItems.systems[name].cpuLevel = 0;
    newOwnedItems.systems[name].gpuLevel = 0;
    newOwnedItems.systems[name].ram = 2;
    console.log(newOwnedItems);
    setBitcoins(bitcoins - price);
    setOwnedItems(newOwnedItems);
  }
  function buyUpgrade(item) {
    const price = calcItemPrice(item, false, selectedSystem);
    if (price > bitcoins) return;
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
        throw "Item value " + item + " is not valid";
    }
    setBitcoins(bitcoins - price);
    setOwnedItems(newOwnedItems);
  }
  // Calculates the price of an item
  function calcItemPrice(item, formatted = false, system = selectedSystem) {
    let level = 1;
    let priceModifier;
    switch (item) {
      case "cpu":
        priceModifier = 30 * ownedItems.systems[system].priceModifier;
        level += ownedItems.systems[system].cpuLevel;
        break;
      case "gpu":
        priceModifier = ownedItems.systems[system].priceModifier;
        level += ownedItems.systems[system].gpuLevel;
        break;
      case "ram":
        priceModifier = ownedItems.systems[system].priceModifier;
        level += ownedItems.systems[system].ram;
        break;
      default:
        throw `Invalid item ${item}`;
    }
    let price = priceModifier * 1.15 ** level; // each upgrade increases cost by 15%

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
    systemBps *= system.cpuLevel + 1; // note: need to tune this later
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
        buyItem={buyUpgrade}
        ownedItems={ownedItems}
        calcItemPrice={calcItemPrice}
      />
    </aside>
  );
}

function Systems({
  setSelected,
  buySystem,
  ownedItems,
  calcSystemBps,
  systemHasUpgrades,
}) {
  // All the data for systems upgrades is stored here
  // Most Systems and descriptions were generated with Bard (https://bard.google.com/)
  const cpus = [
    {
      name: "Intel Pentium Gold G6405",
      desc: "Came with the PC. Perfect for basic tasks like checking email and watching cat videos.",
      clock: "Base clock: 4.1 GHz",
    },
    {
      name: "AMD Athlon 3000G",
      desc: "This budget 4-core processor is like that surprisingly good movie you found on Netflix. It might not be a blockbuster, but it'll get the job done.",
      clock: "Base clock: 3.5 GHz, Boost clock: 3.8 GHz",
    },
    {
      name: "Intel Core i3-12100F",
      desc: "This entry-level 6-core processor is not the flashiest, but it'll get you where you need to go.",
      clock: "Base clock: 3.3 GHz, Boost clock: 4.3 GHz.",
    },
  ];
  const gpus = [
    {
      name: "Intel UHD Graphics",
      desc: "It can't run Crysis. There's no point trying.",
      price: 0,
      bps: 0.5,
    },
    {
      name: "NVIDIA GeForce GT 710",
      desc: "The official graphics card of office computers everywhere. Don't expect miracles.",
      price: 100,
      bps: 1,
    },
  ];
  const systems = [
    {
      name: "Your Grandma's Old PC",
      desc: "She never learned how to use it, so she's letting you have it for cheap.",
      unlocksAt: 0,
      special: null,
      price: 20,
      priceModifier: 20,
      baseBps: 0.5,
      items: {
        cpu: {
          name: "Intel Pentium D",
          desc: "Can load most web pages",
        },
        gpu: {
          name: "Intel UHD Graphics",
          desc: "I don't think it can run crisis",
        }
      },
    },
    {
      name: "AliExpress Gaming PC",
      desc: "The Chinese might be spying on you, but it'll at least mine some coins (maybe??)",
      unlocksAt: 200,
      special: null,
      price: 500,
      priceModifier: 500,
      baseBps: 10,
      items: {
        cpu: {
          name: "Intel i-8 Cores",
          desc: "There are definitely less than 8 cores",
        },
        gpu: {
          name: "RTX 2190 Ti",
          desc: "Is this even real?",
        }
      },
    },
    {
      name: "Corsair RGB Mid-Tower",
      desc: "Includes RGB for increased performance",
      unlocksAt: 200,
      special: null,
      price: 5500,
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
        }
      },
      // upgrades: {
      //   cpu: cpus,
      //   gpu: gpus,
      //   ram: { base: 2, max: 2 ** 16 },
      // },
    },
    {
      name: "Crypto Mining Rig",
      desc: "Has slots for multiple GPUs, so it can mine more coins.",
      unlocksAt: 10000,
      special: null,
      price: 16500,
      priceModifier: 16500,
      baseBps: 250,
      items: {
        cpu: {
          name: "2x Intel Xeon E5-1650",
          desc: "Mid-range workstation CPUs optimized for workstation loads (e.g. mining)",
        },
        gpu: {
          name: "4x RTX 2070 Super",
          desc: "The 'Super' stands for 'SUPERgoodatminingcrypto'!!!!!! And yes, the 4 GPUs all have RGB",
        }
      },
    },
  ];

  // Variables
  const { bitcoins } = useContext(Bitcoins);

  const buyClass = (price) =>
    price > bitcoins ? "incomeModifierNegative" : "incomeModifierPositive";

  function onSystemClick(index, owned) {
    const system = systems[index];

    if (owned) {
      setSelected(system.name);
      return;
    }

    const price = systems[index].price;
    buySystem(price, system.name, system);
    owned = ownedItems.systems[system.name] !== undefined;
    if (owned) setSelected(system.name);
  }

  const systemInfoDescriptors = (index, owned) => {
    // Returns some system-specific descriptors based on the system's index
    const name = systems[index].name;
    let descriptors = [];
    if (!owned) {
      const bps = systems[index].baseBps;
      const price = systems[index].price;
      descriptors.push({ text: "Available", class: "default" });
      descriptors.push({
        text: `BPS: ${format(bps)}`,
        class: "incomeModifierPositive",
      });
      descriptors.push({
        text: `Cost: ${format(price)} btc`,
        class: buyClass(price),
      });
      return descriptors;
    }

    const bps = calcSystemBps(name);
    descriptors.push({ text: "Owned", class: "default" });
    if (systemHasUpgrades(name)) {
      descriptors.push({ text: "Overclocks Available!", class: "default" });
    }
    descriptors.push({
      text: `BPS: ${format(bps)}`,
      class: "incomeModifierPositive",
    });
    return descriptors;
  };

  function format(number) {
    // Format numbers so they looks pretty ✨✨
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

  const availableSystems = systems.map((system, index) => {
    const owned = ownedItems.systems[system.name] !== undefined;
    const descriptors = systemInfoDescriptors(index, owned);
    const tooltip = {
      descriptors: descriptors,
      title: system.name,
      desc: system.desc,
    };

    const button = (
      <ItemButton
        onClick={() => onSystemClick(index, owned)}
        owned={owned}
        object={{
          descriptors: descriptors,
          title: system.name,
          type: "System",
        }}
      />
    );

    return (
      <TooltipItem key={system.name} element={button} mainItem={tooltip} />
    );
  });

  return (
    <div class="systems">
      <h3>Systems</h3>
      {availableSystems}
    </div>
  );
}

function SystemUpgrades({ selected, buyItem, calcItemPrice }) {
  const { ownedItems, setOwnedItems } = useContext(OwnedItems);
  const { bitcoins } = useContext(Bitcoins);
  // Price curve: priceModifier * x^(1.5^0.1x)
  // priceModifier * Math.pow(x, Math.pow(1.5, 0.1x))

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
        throw `${item} is not a valid item`;
    }
    return level;
  }

  // const exampleOwnedItems = {
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
    const priceModifier = ownedItems.systems[selected].priceModifier;

    return [
      { text: `Overclock: +${getLevel(item) * 100}%`, class: "default" },
      {
        text: `Cost: ${calcItemPrice(item, true)} btc`,
        class: priceClass(item),
      },
    ];
  };

  if (selected === null) {
    return (
      <div class="systemUpgrades">
        <h3>Upgrades</h3>
        <p class="noUpgrades">Buy and select a system to view upgrades!</p>
      </div>
    );
  }
  return (
    <div class="systemUpgrades">
      <h3>Upgrades for {selected}</h3>
      <TooltipItem
        element={
          <ItemButton
            onClick={() => buyItem("gpu")}
            object={{
              descriptors: buttonDescriptors("gpu"),
              title: ownedItems.systems[selected].items.gpu.name,
              type: "GPU",
            }}
          />
        }
        mainItem={{
          descriptors: [
            { text: "Owned", class: "default" },
            { text: "BPS: ", class: "incomeModifierPositive" },
          ],
          title: ownedItems.systems[selected].items.gpu.name,
          desc: ownedItems.systems[selected].items.gpu.desc,
        }}
      />
      <TooltipItem
        element={
          <ItemButton
            onClick={() => buyItem("cpu")}
            object={{
              descriptors: buttonDescriptors("cpu"),
              title: ownedItems.systems[selected].items.cpu.name,
              type: "CPU",
            }}
          />
        }
        mainItem={{
          descriptors: [
            { text: "Owned", class: "default" },
            { text: "BPS: ", class: "incomeModifierPositive" },
          ],
          title: ownedItems.systems[selected].items.cpu.name,
          desc: ownedItems.systems[selected].items.cpu.desc,
        }}
        // additionalContent={[""]}
      />
      <TooltipItem
        element={
          <ItemButton
            onClick={() => buyItem("ram")}
            object={{
              descriptors: buttonDescriptors("ram"),
              title: `${getLevel("ram")} GB`,
              type: "RAM",
            }}
          />
        }
        mainItem={{
          descriptors: [
            { text: "Owned", class: "default" },
            { text: "BPS: ", class: "incomeModifierPositive" },
          ],
          title: getLevel("ram") + " GB",
          desc: "",
        }}
        // additionalContent={[""]}
      />
    </div>
  );
}

function ItemButton({
  object,
  onClick,
  owned = undefined, // if supplied, renders "click to buy" or "click to manage" underneath
}) {
  // object = {
  //   descriptors: [
  //     { text: "Cost: 50 btc", class: "" },
  //     { text: "BPS: 5", class: "" },
  //   ],
  //   title: "Your Grandma's Old PC",
  //   type: "System",
  // };
  const descriptors = object.descriptors.map((descriptor, index) => (
    <span
      key={`${descriptor.text}${index}`}
      class={"descriptor " + descriptor.class}
    >
      {descriptor.text}
    </span>
  ));
  const manageText = () => {
    if (owned === undefined) {
      return;
    }
    return owned ? "Click to manage system >" : "Click to purchase system";
  };
  return (
    <button onClick={onClick}>
      <div class="descriptors">{descriptors}</div>
      <p class="buttonTitle">{object.title}</p>
      <p class="buttonType">{object.type}</p>
      <p class="manage">{manageText()}</p>
    </button>
  );
}

function TooltipItem({ element, mainItem, additionalContent = [] }) {
  // Examples
  // mainItem = {
  //   descriptors: [
  //     { text: "Owned", class: "" },
  //     { text: "BPS: 5", class: "" },
  //   ],
  //   title: "Your Grandma's Old PC",
  //   desc: "She never learned how to use it, so she's letting you have it for cheap",
  // };
  // additionalContent = [/* array of strings */];

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
      return (
        <span
          key={`tooltipAddItem${mainItem.title}${item}`}
          class={"tooltipAddItem"}
        >
          {item}
        </span>
      );
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
        {_additionalContent}
      </>
    );
  };

  return (
    <Tippy className="tooltip" placement="left" content={tooltip()}>
      <span>{element}</span>
    </Tippy>
  );
}

function Upgrade({ name, price, priceMultiplier, bpsPerUpgrade, maxLevel }) {
  // Upgrades
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
