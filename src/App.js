import { useState, useEffect, createContext, useContext } from "react";
import bitcoinImg from "./bitcoin.png";
import "./App.css";

const Bitcoins = createContext(0);
const Bps = createContext(0);

// I know this code is an eye-soar, but this is what happens when you have to submit code as a .pdf

// Note-- since this is written in ReactJS, all the functions that begin with an uppercase letter
// (like the one right below this comment) are **react components**, not "procedures". Functions within
// them (that do not start with an uppercase letter) are "procedures".

function App() {
  const [bitcoins, setBitcoins] = useState(0);
  const [bps, setBps] = useState(0);

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
    let baseBps;
  }

  return (
    <Bitcoins.Provider value={{ bitcoins, setBitcoins }}>
      <Bps.Provider value={{ bps, setBps }}>
        <Rig />
        <MainCounters total={bitcoins} bps={bps} />
        <Bitcoin />
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
  return (
    <>
      <h1 class="totalBitcoin">Bitcoin: {Math.floor(total)}</h1>
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
      price: 5500,
      modifier: 5,
    },
  ];
  const gpus = [
    {
      name: "Intel UHD Graphics",
      desc: "It can't run Crysis. There's no point trying.",
      price: 0,
      bps: 5,
    },
  ];
  const chassis = [
    {
      name: "Your grandma's old PC",
      desc: "She never learned how to use it, so she's letting you have it for cheap.",
      price: 20,
      maxMoboLevel: 1,
    },
  ];
  const ram = [];
  const mobos = [];

  // Variables
  const { bitcoins, setBitcoins } = useContext(Bitcoins);
  const { bps, setBps } = useContext(Bps);
  const [chassisLevel, setChassisLevel] = useState(-1); // start without one owned
  const [cpuLevel, setCpuLevel] = useState(0);
  const [gpuLevel, setGpuLevel] = useState(0);
  const [ramLevel, setRamLevel] = useState(0);
  const [moboLevel, setMoboLevel] = useState(0);

  function getLevel(item) {
    switch (item) {
      case "cpu":
        return cpuLevel;
      case "gpu":
        return gpuLevel;
      case "chassis":
        return chassisLevel;
      case "ram":
        return ramLevel;
      case "mobo":
        return moboLevel;
      default:
        throw `'${item} is not a valid parameter in getLevel()!`;
    }
  }
  function setLevel(item, newValue) {
    switch (item) {
      case "cpu":
        setCpuLevel(newValue);
        break;
      case "gpu":
        setGpuLevel(newValue);
        break;
      case "chassis":
        setChassisLevel(newValue);
        break;
      case "ram":
        setRamLevel(newValue);
        break;
      case "mobo":
        setMoboLevel(newValue);
        break;
      default:
        throw `'${item}' is not a valid parameter in setLevel()!`;
    }
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

  function availableHardware() {
    // Returns everything you can buy
    if (chassisLevel === -1) {
      // if you haven't bought a chassis, it's the only thing available to you
      return (
        <>
          <button onClick={() => buy("chassis")}>
            <p>Chassis</p>
            {calculateItem("chassis", chassisLevel)}
          </button>
        </>
      );
    } else {
      return (
        <>
          <button onClick={() => buy("chassis")}>
            <p>Chassis</p>
            {calculateItem("chassis")}
          </button>
          <button onClick={() => buy("cpu")}>
            <p>CPU</p>
            {calculateItem("cpu")}
          </button>
          <button onClick={() => buy("gpu")}>
            <p>GPU</p>
            {calculateItem("gpu")}
          </button>
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
            <p>
              <span class="desc">{_item.desc}</span>
            </p>
          </>
        );
      }
    }

    function formatNext(allItems) {
      if (level + 1 < allItems.length) {
        const _item = allItems[level + 1];
        const buyClass = _item.price <= bitcoins ? "canBuy" : "cannotBuy";
        return (
          <>
            <p class="nextPurchase">Buy: {_item.name}</p>
            <p>
              <span class="desc ">{_item.desc}</span>
            </p>
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
  }

  return (
    <div class="hardware">
      <h3>Manage your rig</h3>
      {availableHardware()}
    </div>
  );
}

function Upgrade({ name, price, priceMultiplier, bpsPerUpgrade, maxLevel }) {
  // Upgrades
  const { bitcoins, setBitcoins } = useContext(Bitcoins);
  const { bps, setBps } = useContext(Bps);
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
    setBps(bps + bpsPerUpgrade);
    setCost(price * priceMultiplier * level);
    if (level >= maxLevel) setLocked(true);
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
