import React from "react";
import { IItemButton } from "../types/interface/IItemButton.tsx";

// These are the buttons that you can click to buy/select systems/upgrades
function ItemButton({
  object,
  onClick,
  ownedText = undefined, // if supplied, renders the text underneath
}: IItemButton) {
  const descriptors = object.descriptors.map((descriptor, index) => (
    <span
      key={`${descriptor.text}${index}`}
      className={"descriptor " + descriptor.class}
    >
      {descriptor.text}
    </span>
  ));
  return (
    <button onClick={onClick}>
      <div className="descriptors">{descriptors}</div>
      <p className="buttonTitle">{object.title}</p>
      <p className="buttonType">{object.type}</p>
      <p className="manage">{ownedText}</p>
    </button>
  );
}

export default ItemButton;