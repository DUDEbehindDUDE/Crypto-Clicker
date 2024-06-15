import React from "react";
import { useContext } from "react";
import { Bitcoins } from "../App.tsx";
import bitcoinImg from "../media/bitcoin.png";
import { IBitcoin } from "../types/interface/IBitcoin.ts";

// The Bitcoin (the one you can click)
function Bitcoin({ bitcoinPerClick }: IBitcoin) {
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
      className="bitcoin"
      alt="bitcoin"
      draggable="false"
      src={bitcoinImg}
      onMouseDown={onClick} // <-- we are using onMouseDown instead of onClick
    /> //                      because onClick doesn't work well with coin wobble
  );
}

export default Bitcoin;
