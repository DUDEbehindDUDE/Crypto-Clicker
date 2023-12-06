import { useState, useEffect, createContext, useContext } from "react";
import bitcoinImg from "./bitcoin.png";
import "./App.css";

const Bitcoins = createContext(0);
const Bps = createContext(0);

function App() {
  const [bitcoins, setBitcoins] = useState(0);
  const [bps, setBps] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBitcoins(bitcoins + bps);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [bitcoins, bps]);

  return (
    <Bitcoins.Provider value={{ bitcoins, setBitcoins }}>
    <Bps.Provider value={{ bps, setBps }}>
      <Upgrades />
      <MainCounters total={bitcoins} bps={bps} />
      <Bitcoin />
    </Bps.Provider>
    </Bitcoins.Provider>
  );
}

function Bitcoin() {
  const { bitcoins, setBitcoins } = useContext(Bitcoins);
  function onClick() {
    setBitcoins(bitcoins + 1);
  }
  return (
    <img class="bitcoin" alt="bitcoin" src={bitcoinImg} onClick={onClick} />
  );
}

function MainCounters({ total, bps }) {
  return (
    <>
      <h1 class="totalBitcoin">Bitcoin: {total}</h1>
      <p class="bitcoinPerSecond">{bps}/s</p>
    </>
  );
}

function Upgrades() {
  return (
    <aside class="upgrades">
      <h3>Upgrades</h3>
      <Upgrade name="GPU" price="10" priceMultiplier={1.1} bpsPerUpgrade={5} />
      <Upgrade name="CPU" price="40" priceMultiplier={1.1} bpsPerUpgrade={20} />
    </aside>
  );
}

function Upgrade({ name, price, priceMultiplier, bpsPerUpgrade }) {
  const { bitcoins, setBitcoins } = useContext(Bitcoins);
  const { bps, setBps } = useContext(Bps);
  const [level, setLevel] = useState(1);
  const [cost, setCost] = useState(price);
  function upgrade() {
    if (bitcoins < cost) return;
    setBitcoins(bitcoins - cost);
    setLevel(level + 1);
    setBps(bps + bpsPerUpgrade);
    setCost(price * priceMultiplier * level);
  }
  return (
    <button class="upgrade" onClick={upgrade}>
      <p>{name}</p>
      <p>Level: {level}</p>
      <p>Cost: {cost}</p>
    </button>
  );
}

export default App;
