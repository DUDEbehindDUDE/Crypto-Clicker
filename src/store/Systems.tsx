import React, { useContext } from "react";
import { Bitcoins } from "../App.tsx";
import ItemButton from "./ItemButton.tsx";
import StoreItemTooltip from "../tooltip/StoreItemTooltip.tsx";

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
    let descriptors: any = [];
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
              {<span className={""}>{format(calcSystemBps(system.name))}</span>}{" "}
              BPS · Manage system {">"}
            </> // and the > is in brackets because otherwise, it thinks it's an HTML tag or whatever
          ) : (
            <span className={buyClass(systems[index].price)}>
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
      <StoreItemTooltip
        key={system.name}
        element={button}
        mainItem={tooltip}
        additionalContent={addContent}
      />
    );
  });

  return (
    <div className="systems">
      <h3>Systems</h3>
      {availableSystems}
    </div>
  );
}

export default Systems;