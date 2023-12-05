import { useState, useEffect } from "react";
import bitcoinImg from "./bitcoin.png";
import "./App.css";

function App() {
  let [bitcoin, setBitcoin] = useState(0);
  let [bps, setBps] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBitcoin(bitcoin + bps);
    }, 1000);
    return () => {
      clearInterval(interval);
    }
  }, [bitcoin, bps]);

  function onBitcoinClick() {
    setBitcoin(bitcoin + 1);
  }
  return (
    <>
      <Upgrades bitcoin={bitcoin} setBitcoin={setBitcoin} setBps={setBps} bps={bps} />
      <MainCounters total={bitcoin} bps={bps} />
      <Bitcoin onBitcoinClick={onBitcoinClick} />
    </>
  );
}

function Bitcoin({ onBitcoinClick }) {
  return (
    <img
      class="bitcoin"
      alt="bitcoin"
      src={bitcoinImg}
      onClick={onBitcoinClick}
    />
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

function Upgrades({ bitcoin, setBitcoin, setBps, bps }) {
  return (
    <aside class="upgrades">
      <h3>Upgrades</h3>
      <Upgrade
        name="GPU"
        price="10"
        priceMultiplier={1.1}
        bpsPerUpgrade={5}
        bitcoin={bitcoin}
        setBitcoin={setBitcoin}
        setBps={setBps}
        bps={bps}
        />
      <Upgrade
        name="CPU"
        price="40"
        priceMultiplier={1.1}
        bpsPerUpgrade={20}
        bitcoin={bitcoin}
        setBitcoin={setBitcoin}
        setBps={setBps}
        bps={bps}
      />
    </aside>
  );
}

function Upgrade({ name, price, priceMultiplier, bpsPerUpgrade, bitcoin, setBitcoin, bps, setBps }) {
  let [level, setLevel] = useState(1);
  let [cost, setCost] = useState(price);
  function upgrade() {
    if (bitcoin < cost) return;
    setBitcoin(bitcoin - cost);
    setLevel(level + 1);
    setBps(bps + bpsPerUpgrade)
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
