import { useState, useEffect, createContext, useContext } from "react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import bitcoinImg from "./bitcoin.png";
import "./App.css";

const Bitcoins = createContext(0);
const Bps = createContext();
const RigItems = createContext();

// I know this code is an eye-soar, but this is what happens when you have to submit code as a .pdf

// Note-- since this is written in ReactJS, all the functions that begin with an uppercase letter
// (like the one right below this comment) are **react components**, not "procedures". Functions within
// them (that do not start with an uppercase letter) are "procedures".

function App() {
  const [bitcoins, setBitcoins] = useState(0);
  const [bps, setBps] = useState(0);
  const [rigItems, setRigItems] = useState({
    rig: {
      cpu: {
        level: 0,
        modifier: 0,
      },
      gpu: {
        level: 0,
        bps: 0,
      },
      chassis: {
        level: -1, // start without one owned
      },
      ram: {
        amount: 2, // Gigabytes
        modifier: 0,
      },
      mobo: {
        level: 0,
      },
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

  function calculateBps() {
    if (rigItems.rig.chassis.level === -1) {
      setBps(0);
      return;
    }
    let baseBps = rigItems.rig.gpu.bps;
    let bpsModifier = rigItems.rig.cpu.modifier;
    let ramModifier = rigItems.rig.ram.modifier / 100 + 1;
    let _bps = baseBps * (bpsModifier / 100 + 1) * ramModifier;

    let upgradeBps = 0;
    let upgradeModifier = 0;
    rigItems.upgrades.forEach((upgrade) => {
      if (upgrade?.modifier !== undefined) {
        upgradeModifier += upgrade.modifier;
      }
      if (upgrade?.bps !== undefined) {
        upgradeBps += upgrade.bps;
      }
    });

    _bps += upgradeBps * (bpsModifier / 100 + 1) * ramModifier;
    _bps *= upgradeModifier / 100 + 1;

    setBps(_bps);
    return;
  }

  return (
    <Bitcoins.Provider value={{ bitcoins, setBitcoins }}>
      <Bps.Provider value={{ bps, calculateBps }}>
        <RigItems.Provider value={{ rigItems, setRigItems }}>
          <div class="mainContent">
            <MainCounters total={bitcoins} bps={bps} />
            <Bitcoin />
          </div>
          <Rig />
        </RigItems.Provider>
      </Bps.Provider>
    </Bitcoins.Provider>
  );
}

function Bitcoin() {
  // The coin
  const { setBitcoins } = useContext(Bitcoins);
  function onClick() {
    setBitcoins((bitcoins) => bitcoins + 1);
  }
  return (
    <img class="bitcoin" alt="bitcoin" src={bitcoinImg} onClick={onClick} />
  );
}

function MainCounters({ total, bps }) {
  // Bitcoin and bps counter
  function calcDisplayBitcoin() {
    const bitcoins = Math.floor(total);
    if (bitcoins >= 1000000) {
      return `${Math.round(bitcoins / 10000) / 100} million`;
    }
    return bitcoins;
  }

  return (
    <>
      <h1 class="totalBitcoin">Bitcoin: {calcDisplayBitcoin()}</h1>
      <p class="bitcoinPerSecond">{bps}/s</p>
    </>
  );
}

function Rig() {
  // Everything you can buy is part of this component
  const { bitcoins } = useContext(Bitcoins);
  const [upgradesAvailable, setUpgradesAvailable] = useState(false);

  function returnUpgrades() {
    if (!upgradesAvailable) {
      // Check if upgrades can be unlocked, currently unlocks once you hit 1000btc
      if (bitcoins >= 1000) {
        setUpgradesAvailable(true);
      } else {
        return;
      }
    }
    return (
      <div class="upgrades">
        <h3>Upgrades</h3>
        <Upgrade
          name="Wifi Card"
          price={1000}
          priceMultiplier={15}
          bpsPerUpgrade={500}
          maxLevel={5}
        />
      </div>
    );
  }
  return (
    <aside class="rig">
      <Hardware />
      {returnUpgrades()}
    </aside>
  );
}

function Hardware() {
  // All the data for rig upgrades is stored here
  // Most hardware and descriptions were generated with Bard (https://bard.google.com/)
  const cpus = [
    {
      name: "Intel Pentium Gold G6405",
      desc: "Came with the PC. Perfect for basic tasks like checking email and watching cat videos.",
      clock: "Base clock: 4.1 GHz",
      price: 0,
      modifier: 0,
    },
    {
      name: "AMD Athlon 3000G",
      desc: "This budget 4-core processor is like that surprisingly good movie you found on Netflix. It might not be a blockbuster, but it'll get the job done and maybe even surprise you.",
      clock: "Base clock: 3.5 GHz, Boost clock: 3.8 GHz",
      price: 10,
      modifier: 50000,
    },
  ];
  const gpus = [
    {
      name: "Intel UHD Graphics",
      desc: "It can't run Crysis. There's no point trying.",
      price: 0,
      bps: 0.1,
    },
  ];
  const chassis = [
    {
      name: "Your grandma's old PC",
      desc: "She never learned how to use it, so she's letting you have it for cheap.",
      price: 20,
      maxMoboLevel: 1,
      bps: 5, // this is only visual; it doesn't affect the actual BPS calculations
    },
  ];
  const ram = [];
  const mobos = [];

  // Variables
  const { bitcoins, setBitcoins } = useContext(Bitcoins);
  const { calculateBps } = useContext(Bps);
  const { rigItems, setRigItems } = useContext(RigItems);

  function getLevel(item) {
    const _items = rigItems.rig;
    switch (item) {
      case "cpu":
        return _items.cpu.level;
      case "gpu":
        return _items.gpu.level;
      case "chassis":
        return _items.chassis.level;
      case "ram":
        return _items.ram.amount;
      case "mobo":
        return _items.mobo.amount;
      default:
        throw `'${item} is not a valid parameter in getLevel()!`;
    }
  }
  function setLevel(item, newLevel) {
    let newRigItems = rigItems;
    let cpuModifier = cpus[getLevel("cpu")].modifier;
    let gpuModifier = gpus[getLevel("gpu")].bps;
    let ramModifier = 0; // ram[getLevel("gpu")].modifier;
    switch (item) {
      case "cpu":
        newRigItems.rig.cpu.level = newLevel;
        cpuModifier = cpus[newLevel].modifier;
        break;
      case "gpu":
        newRigItems.rig.gpu.level = newLevel;
        gpuModifier = gpus[newLevel].modifier;
        break;
      case "chassis":
        newRigItems.rig.chassis.level = newLevel;
        break;
      case "ram":
        newRigItems.rig.ram.amount = newLevel;
        ramModifier = ram[newLevel].modifier;
        break;
      case "mobo":
        newRigItems.rig.mobo.level = newLevel;
        break;
      default:
        throw `'${item}' is not a valid parameter in setLevel()!`;
    }
    newRigItems.rig.gpu.bps = gpuModifier;
    newRigItems.rig.cpu.modifier = cpuModifier;
    setRigItems(newRigItems);
  }
  function getAllItems(item) {
    switch (item) {
      case "cpu":
        return cpus;
      case "gpu":
        return gpus;
      case "chassis":
        return chassis;
      case "ram":
      // return ram;
      case "mobo":
        // return mobos;
        return;
      default:
        throw `'${item}' is not a valid parameter in setLevel()!`;
    }
  }
  function generateTooltipObjects(item) {
    // Generates an array of objects to be rendered by the tooltip
    const allItems = getAllItems(item);
    const level = getLevel(item);
    const ownedDescriptors = [{ text: "Owned", class: "default" }];

    if (allItems[level]?.bps !== undefined) {
      const bps = allItems[level].bps;
      const bpsClass = () => {
        if (bps > 0) return "incomeModifierPositive";
        else if (bps < 0) return "incomeModifierNegative";
        else return "incomeModifier0";
      };
      ownedDescriptors.push({
        text: `Bps: ${bps}`,
        class: bpsClass(),
      });
    }
    if (allItems[level]?.modifier !== undefined) {
      const modifier = allItems[level].modifier;
      const modifierClass = () => {
        if (modifier > 0) return "incomeModifierPositive";
        else if (modifier < 0) return "incomeModifierNegative";
        else return "incomeModifier0";
      };
      ownedDescriptors.push({
        text: `${modifier >= 0 ? "+" : ""}${modifier}% bps`,
        class: modifierClass(),
      });
    }
    if (level >= allItems.length - 1) {
      ownedDescriptors.push({ text: "Max Upgrades!", class: "max" });
    }
    const ownedItemObj =
      level === -1
        ? {
            title: "None!",
            desc: "There's a whole lot of nothing here.",
            descriptors: [{ text: "Owned", class: "default" }],
          }
        : {
            title: allItems[level].name,
            desc: allItems[level].desc,
            descriptors: ownedDescriptors,
          };

    const nextDescriptors =
      allItems[level + 1] !== undefined
        ? [{ text: "Available", class: "default" }]
        : null;
    if (nextDescriptors !== null) {
      if (allItems[level + 1]?.bps !== undefined) {
        const bps = allItems[level + 1].bps;
        const bpsClass = () => {
          if (bps > 0) return "incomeModifierPositive";
          else if (bps < 0) return "incomeModifierNegative";
          else return "incomeModifier0";
        };
        nextDescriptors.push({
          text: `Bps: ${bps}`,
          class: bpsClass(),
        });
      }
      if (allItems[level + 1]?.modifier !== undefined) {
        const modifier = allItems[level + 1].modifier;
        const modifierClass = () => {
          if (modifier > 0) return "incomeModifierPositive";
          else if (modifier < 0) return "incomeModifierNegative";
          else return "incomeModifier0";
        };
        nextDescriptors.push({
          text: `${modifier >= 0 ? "+" : ""}${modifier}% bps`,
          class: modifierClass(),
        });
      }

      nextDescriptors.push({
        text: `Cost: ${allItems[level + 1].price} btc`,
        class:
          bitcoins >= allItems[level + 1].price
            ? "incomeModifierPositive"
            : "incomeModifierNegative",
      });
    }
    const nextItemObj =
      level + 1 > allItems.length - 1
        ? null
        : {
            title: allItems[level + 1].name,
            desc: allItems[level + 1].desc,
            descriptors: nextDescriptors,
          };
    if (!nextItemObj) {
      return [ownedItemObj];
    } else {
      return [ownedItemObj, nextItemObj];
    }
  }

  function availableHardware() {
    // Returns everything you can buy
    if (getLevel("chassis") === -1) {
      // if you haven't bought a chassis, it's the only thing available to you
      return (
        <Tooltip
          element={
            <button onClick={() => buy("chassis")}>
              <p>Chassis</p>
              {calculateItem("chassis", getLevel("chassis"))}
            </button>
          }
          objects={generateTooltipObjects("chassis")}
        />
      );
    } else {
      return (
        <>
          <Tooltip
            element={
              <button onClick={() => buy("chassis")}>
                <p>Chassis</p>
                {calculateItem("chassis")}
              </button>
            }
            objects={generateTooltipObjects("chassis")}
          />
          <Tooltip
            element={
              <button onClick={() => buy("cpu")}>
                <p>CPU</p>
                {calculateItem("cpu")}
              </button>
            }
            objects={generateTooltipObjects("cpu")}
          />
          <Tooltip
            element={
              <button onClick={() => buy("gpu")}>
                <p>GPU</p>
                {calculateItem("gpu")}
              </button>
            }
            objects={generateTooltipObjects("gpu")}
          />
        </>
      );
    }
  }

  function calculateItem(item) {
    // Returns descriptions of the items
    const level = getLevel(item);
    switch (item) {
      case "chassis":
        return (
          <>
            {formatOwned(chassis)}
            {formatNext(chassis)}
          </>
        );
      case "cpu":
        return (
          <>
            {formatOwned(cpus)}
            {formatNext(cpus)}
            <p></p>
          </>
        );
      case "gpu":
      case "ram":
      case "mobo":
        return;
      default:
        throw `Invalid item '${item}' sent to Hardware.calculateItem()!`;
    }

    function formatOwned(allItems) {
      // returns the owned item
      if (level === -1) {
        return (
          <p>
            Owned: <span class="none">none!</span>
          </p>
        );
      } else {
        const _item = allItems[level];
        return (
          <>
            <p>
              Owned: <span class="owned">{_item.name}</span>
            </p>
          </>
        );
      }
    }

    function formatNext(allItems) {
      // returns the next item
      if (level + 1 < allItems.length) {
        const _item = allItems[level + 1];
        const buyClass = _item.price <= bitcoins ? "canBuy" : "cannotBuy";
        return (
          <>
            <p class="nextPurchase">Buy: {_item.name}</p>
            <p class={buyClass}>Cost: {_item.price} btc</p>
          </>
        );
      } else {
        return (
          <p class="nextPurchase">
            <span class="max">Max upgrades!</span>
          </p>
        );
      }
    }
  }

  function buy(item) {
    // Checks if the item can be upgraded, and if so, purchases it
    const level = getLevel(item);
    const newLevel = level + 1;
    const allItems = getAllItems(item);
    if (newLevel >= allItems.length) return;

    const price = allItems[newLevel].price;
    if (price > bitcoins) return;

    setBitcoins(bitcoins - price);
    setLevel(item, newLevel);
    calculateBps();
  }

  return (
    <div class="hardware">
      <h3>Manage your rig</h3>
      {availableHardware()}
    </div>
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
      <span key={`${descriptor.text}${index}`} class={descriptor.class}>
        {descriptor.text}
      </span>
    ));
    const title = object.title;
    const desc = `"${object.desc}"`;
    const separator =
      index < objects.length - 1 ? (
        <span class="separator">———————————————————————–</span>
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
      {element}
    </Tippy>
  );
}

function Upgrade({ name, price, priceMultiplier, bpsPerUpgrade, maxLevel }) {
  // Upgrades
  const { bitcoins, setBitcoins } = useContext(Bitcoins);
  const { calculateBps } = useContext(Bps);
  const { rigItems, setRigItems } = useContext(RigItems);
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

    let newRigItems = rigItems;
    newRigItems.upgrades.push({ bps: bpsPerUpgrade });
    setRigItems(newRigItems);
    calculateBps();
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
