import { useState, useEffect, createContext, useContext } from "react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import bitcoinImg from "./media/bitcoin.png";
import "./App.css";

const Bitcoins = createContext(0);
const Bps = createContext();
const OwnedItems = createContext();

// I know this code is an eye-soar, but this is what happens when you have to submit code as a .pdf

// Note-- since this is written in ReactJS, all the functions that begin with an uppercase letter
// (like the one right below this comment) are **react components**, not "procedures". Functions within
// them (that do not start with an uppercase letter) are "procedures".

function App() {
  const [bitcoins, setBitcoins] = useState(0);
  const [bps, setBps] = useState(0);
  const [ownedItems, setOwnedItems] = useState({
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
  useEffect(() => {
    // Add 1/10th of the bps to total bitcoin every 100ms
    const bpsInterval = setInterval(handleBps, 100);
    return () => {
      clearInterval(bpsInterval);
    };
  }, [bps]);
  function handleBps() {
    setBitcoins((bitcoins) => bitcoins + bps / 10);
  }

  useEffect(() => {
    // Recalculate BPS when owned items changes
    // note: set ownedItems.hasChange to true, otherwise it won't update
    console.log("recalculating BPS");
    let newBps = 0;
    const systems = ownedItems.systems;

    for (const system in systems) {
      const currentSystem = systems[system];
      let systemBps =
        (currentSystem.gpuLevel + 1) ** 2.2 * currentSystem.baseBps;
      systemBps *= currentSystem.cpuLevel / 5 + 1; // note: need to tune this later
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
    const clickAudio = new Audio("click.ogg");
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

  bps = Math.round(bps * 10) / 10
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

  // function returnUpgrades() {
  //   if (!upgradesAvailable) {
  //     // Check if upgrades can be unlocked, currently unlocks once you hit 1000btc
  //     if (bitcoins >= 1000) {
  //       setUpgradesAvailable(true);
  //     } else {
  //       return;
  //     }
  //   }
  //   return (
  //     <div class="upgrades">
  //       <h3>Upgrades</h3>
  //       <Upgrade
  //         name="Wifi Card"
  //         price={1000}
  //         priceMultiplier={15}
  //         bpsPerUpgrade={500}
  //         maxLevel={5}
  //       />
  //     </div>
  //   );
  // }
  function buySystem(name, properties) {
    // exampleProperties = {
    //   baseBps: 0.1,
    //   priceModifier: 1,
    // }
    let newOwnedItems = ownedItems;
    newOwnedItems.hasChange = true;
    newOwnedItems.systems[name] = properties;
    newOwnedItems.systems[name].cpuLevel = 0;
    newOwnedItems.systems[name].gpuLevel = 0;
    newOwnedItems.systems[name].ram = 2;
    console.log(newOwnedItems);
    setOwnedItems(newOwnedItems);
  }
  function buyUpgrade(item, cost) {
    if (cost > bitcoins) return;
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
    setBitcoins(bitcoins - cost);
    setOwnedItems(newOwnedItems);
  }

  return (
    <aside class="store">
      {/* {returnUpgrades()} */}
      <Systems
        setSelected={setSelectedSystem}
        buySystem={buySystem}
        ownedItems={ownedItems}
      />
      <SystemUpgrades
        selected={selectedSystem}
        buyItem={buyUpgrade}
        ownedItems={ownedItems}
      />
    </aside>
  );
}

function Systems({ setSelected, buySystem, ownedItems }) {
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
      upgrades: {
        cpu: cpus,
        gpu: gpus,
        ram: { base: 2, max: 2 ** 16 },
      },
    },
    {
      name: "Corsair RGB Mid-Tower",
      desc: "Includes RGB for increased performance",
      unlocksAt: 200,
      special: null,
      price: 500,
      priceModifier: 500,
      baseBps: 10,
      upgrades: {
        cpu: cpus,
        gpu: gpus,
        ram: { base: 2, max: 2 ** 16 },
      },
    },
  ];

  // Variables
  const { bitcoins, setBitcoins } = useContext(Bitcoins);

  function onSystemClick(index) {
    const system = systems[index];
    let owned = false;
    for (const ownedSystem in ownedItems.systems) {
      // console.log(ownedSystem)
      if (ownedSystem === system.name) owned = true;
    }
    if (owned) {
      setSelected(system.name);
      // console.log("owned");
      return;
    }

    const price = systems[index].price;
    if (bitcoins >= price) {
      setBitcoins(bitcoins - price);
      buySystem(system.name, {
        baseBps: system.baseBps,
        priceModifier: system.priceModifier,
      });
      setSelected(system.name);
    }
  }
  // function generateTooltipObjects(item) {
  //   // Generates an array of objects to be rendered by the tooltip
  //   const allItems = getAllItems(item);
  //   const level = getLevel(item);
  //   const ownedDescriptors = [{ text: "Owned", class: "default" }];

  //   if (allItems[level]?.bps !== undefined) {
  //     const bps = allItems[level].bps;
  //     const bpsClass = () => {
  //       if (bps > 0) return "incomeModifierPositive";
  //       else if (bps < 0) return "incomeModifierNegative";
  //       else return "incomeModifier0";
  //     };
  //     ownedDescriptors.push({
  //       text: `Bps: ${bps}`,
  //       class: bpsClass(),
  //     });
  //   }
  //   if (allItems[level]?.modifier !== undefined) {
  //     const modifier = allItems[level].modifier;
  //     const modifierClass = () => {
  //       if (modifier > 0) return "incomeModifierPositive";
  //       else if (modifier < 0) return "incomeModifierNegative";
  //       else return "incomeModifier0";
  //     };
  //     ownedDescriptors.push({
  //       text: `${modifier >= 0 ? "+" : ""}${modifier}% bps`,
  //       class: modifierClass(),
  //     });
  //   }
  //   if (level >= allItems.length - 1) {
  //     ownedDescriptors.push({ text: "Max Upgrades!", class: "max" });
  //   }
  //   const ownedItemObj =
  //     level === -1
  //       ? {
  //           title: "None!",
  //           desc: "There's a whole lot of nothing here.",
  //           descriptors: [{ text: "Owned", class: "default" }],
  //         }
  //       : {
  //           title: allItems[level].name,
  //           desc: allItems[level].desc,
  //           descriptors: ownedDescriptors,
  //         };

  //   const nextDescriptors =
  //     allItems[level + 1] !== undefined
  //       ? [{ text: "Available", class: "default" }]
  //       : null;
  //   if (nextDescriptors !== null) {
  //     if (allItems[level + 1]?.bps !== undefined) {
  //       const bps = allItems[level + 1].bps;
  //       const bpsClass = () => {
  //         if (bps > 0) return "incomeModifierPositive";
  //         else if (bps < 0) return "incomeModifierNegative";
  //         else return "incomeModifier0";
  //       };
  //       nextDescriptors.push({
  //         text: `Bps: ${bps}`,
  //         class: bpsClass(),
  //       });
  //     }
  //     if (allItems[level + 1]?.modifier !== undefined) {
  //       const modifier = allItems[level + 1].modifier;
  //       const modifierClass = () => {
  //         if (modifier > 0) return "incomeModifierPositive";
  //         else if (modifier < 0) return "incomeModifierNegative";
  //         else return "incomeModifier0";
  //       };
  //       nextDescriptors.push({
  //         text: `${modifier >= 0 ? "+" : ""}${modifier}% bps`,
  //         class: modifierClass(),
  //       });
  //     }

  //     nextDescriptors.push({
  //       text: `Cost: ${allItems[level + 1].price} btc`,
  //       class:
  //         bitcoins >= allItems[level + 1].price
  //           ? "incomeModifierPositive"
  //           : "incomeModifierNegative",
  //     });
  //   }
  //   const nextItemObj =
  //     level + 1 > allItems.length - 1
  //       ? null
  //       : {
  //           title: allItems[level + 1].name,
  //           desc: allItems[level + 1].desc,
  //           descriptors: nextDescriptors,
  //         };
  //   if (!nextItemObj) {
  //     return [ownedItemObj];
  //   } else {
  //     return [ownedItemObj, nextItemObj];
  //   }
  // }

  // function buy(item) {
  //   // Checks if the item can be upgraded, and if so, purchases it
  //   const level = getLevel(item);
  //   const newLevel = level + 1;
  //   const allItems = getAllItems(item);
  //   if (newLevel >= allItems.length) return;

  //   const price = allItems[newLevel].price;
  //   if (price > bitcoins) return;

  //   setBitcoins(bitcoins - price);
  //   setLevel(item, newLevel);
  // }

  const availableSystems = systems.map((system, index) => {
    const owned = ownedItems.systems[system.name] !== undefined;
    const ownedDescriptor = owned ? "Owned" : "Available";
    const bps = system.baseBps;
    const descriptors = [
      { text: ownedDescriptor, class: "default" },
      { text: `Base BPS: ${bps}`, class: "incomeModifierPositive" },
    ];

    if (!owned) {
      const price = systems[index].price;
      const priceClass =
        bitcoins >= price ? "incomeModifierPositive" : "incomeModifierNegative";
      descriptors.push({ text: `Cost: ${price}`, class: priceClass });
    }

    const tooltip = [
      {
        descriptors: descriptors,
        title: system.name,
        desc: system.desc,
      },
    ];
    const button = (
      <ItemButton
        onClick={() => onSystemClick(index)}
        owned={owned}
        object={{
          descriptors: descriptors,
          title: system.name,
          type: "System",
        }}
      />
    );
    return <Tooltip key={system.name} element={button} objects={tooltip} />;
  });

  return (
    <div class="systems">
      <h3>Systems</h3>
      {availableSystems}
    </div>
  );
}

function SystemUpgrades({ selected, buyItem }) {
  const { ownedItems, setOwnedItems } = useContext(OwnedItems);
  const { bitcoins } = useContext(Bitcoins);
  // Price curve: priceModifier * x^(1.5^0.1x)
  // priceModifier * Math.pow(x, Math.pow(1.5, 0.1x))

  const priceClass = (item) =>
    bitcoins >= getCost(item)
      ? "incomeModifierPositive"
      : "incomeModifierNegative";

  function getCost(item) {
    const level = getLevel(item) + 1;
    const priceModifier = ownedItems.systems[selected].priceModifier;
    console.log(priceModifier + " " + ownedItems.systems[selected].priceModifier);
    return priceModifier * level ** (1.5 ** (0.1 * level));
  }

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

  const exampleOwnedItems = {
    systems: {
      example: {
        baseBps: 0.1,
        priceModifier: 1,
        cpuLevel: 0,
        gpuLevel: 0,
        ram: 2,
      },
    },
    upgrades: [],
  };

  // const cpuButtonObject = () => {
  //   descriptors:
  // }

  const buttonDescriptors = (item) => {
    const priceModifier = ownedItems.systems[selected].priceModifier;

    return [
      { text: `Level: ${getLevel(item)}`, class: "default" },
      { text: `Cost: ${getCost(item)}`, class: priceClass(item) },
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
      <Tooltip
        element={
          <ItemButton
            onClick={() => buyItem("gpu", getCost("gpu"))}
            object={{
              descriptors: buttonDescriptors("gpu"),
              title: `Level ${getLevel("gpu")}`,
              type: "GPU",
            }}
          />
        }
        objects={[
          {
            descriptors: [
              { text: "Owned", class: "default" },
              { text: "BPS: ", class: "incomeModifierPositive" },
            ],
            title: "Level " + getLevel("gpu"),
            desc: "",
          },
          {
            descriptors: [
              { text: "Available", class: "default" },
              { text: "BPS: ", class: "incomeModifierPositive" },
              { text: `Cost: ${getCost("gpu")} btc`, class: priceClass("gpu") },
            ],
            title: `Level ${getLevel("gpu") + 1}`,
            desc: "",
          },
        ]}
      />
      <Tooltip
        element={
          <ItemButton
            onClick={() => buyItem("cpu", getCost("cpu"))}
            object={{
              descriptors: buttonDescriptors("cpu"),
              title: `Level ${getLevel("cpu")}`,
              type: "CPU",
            }}
          />
        }
        objects={[
          {
            descriptors: [
              { text: "Owned", class: "default" },
              { text: "BPS: ", class: "incomeModifierPositive" },
            ],
            title: "Level " + getLevel("cpu"),
            desc: "",
          },
          {
            descriptors: [
              { text: "Available", class: "default" },
              { text: "BPS: ", class: "incomeModifierPositive" },
              { text: `Cost: ${getCost("cpu")} btc`, class: priceClass("cpu") },
            ],
            title: `Level ${getLevel("cpu") + 1}`,
            desc: "",
          },
        ]}
      />
      <Tooltip
        element={
          <ItemButton
            onClick={() => buyItem("ram", getCost("ram"))}
            object={{
              descriptors: buttonDescriptors("ram"),
              title: `Level ${getLevel("ram")}`,
              type: "RAM",
            }}
          />
        }
        objects={[
          {
            descriptors: [
              { text: "Owned", class: "default" },
              { text: "BPS: ", class: "incomeModifierPositive" },
            ],
            title: "Level " + getLevel("ram"),
            desc: "",
          },
          {
            descriptors: [
              { text: "Available", class: "default" },
              { text: "BPS: ", class: "incomeModifierPositive" },
              { text: `Cost: ${getCost("ram")} btc`, class: priceClass("ram") },
            ],
            title: `${getLevel("ram") ** 2}GB`,
            desc: "",
          },
        ]}
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

function Tooltip({ element, objects }) {
  // Example objects array:
  // objects = [
  //   {
  //     descriptors: [
  //       { text: "Owned", class: "" },
  //       { text: "BPS: 5", class: "" },
  //     ],
  //     title: "Your Grandma's Old PC",
  //     desc: "She never learned how to use it, so she's letting you have it for cheap",
  //   },
  //   {
  //     descriptors: [
  //       { text: "Available", class: "" },
  //       { text: "BPS: 5 -> 10", class: "" },
  //       { text: "Price: 1000 btc", class: "cannotBuy" },
  //     ],
  //     title: "Corsair RGB mid tower",
  //     desc: "A mid tower. Has RGB to increase bitcoin yield.",
  //   },
  // ];

  const tooltip = objects.map((object, index) => {
    const descriptors = object.descriptors.map((descriptor) => (
      <span
        key={`tooltip${descriptor.text}${index}`}
        class={"descriptor " + descriptor.class}
      >
        {descriptor.text}
      </span>
    ));
    const title = object.title;
    const desc = `"${object.desc}"`;
    const separator =
      index < objects.length - 1 ? (
        <span class="separator">———————————————————————</span>
      ) : null;
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
      </>
    );
  });
  return (
    <Tippy className="tooltip" placement="left" content={tooltip}>
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
          <p>Cost: {cost}</p>
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
