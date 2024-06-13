import Tippy from "@tippyjs/react";
import React from "react";
import { IStoreItemTooltip } from "../types/interface/Tooltip";

// Renders tooltips for store items
function StoreItemTooltip({
  element,
  mainItem,
  additionalContent = [],
}: IStoreItemTooltip) {
  // Format tooltip content
  const tooltip = () => {
    // get descriptors if present
    let descriptors = [];
    if (mainItem.descriptors !== undefined) {
      descriptors = mainItem.descriptors.map((descriptor) => (
        <span
          key={`tooltip${descriptor.text}${mainItem.title}`}
          className={"descriptor " + descriptor.class}
        >
          {descriptor.text}
        </span>
      ));
    }

    // if desc is undefined, don't render anything
    const desc =
      mainItem.desc === undefined ? (
        ""
      ) : (
        <aside className="tooltipDesc">
          <p className="desc">{mainItem.desc}</p>
        </aside>
      );

    // add separator between additional content and title/desc
    // if there is additional content
    const separator =
      additionalContent.length > 0 ? <div className="separator" /> : null;

    const _additionalContent = additionalContent.map((item) => {
      return <li key={`tooltipAddItem${mainItem.title}${item}`}>{item}</li>;
    });

    return (
      <>
        <div className="tooltipDescriptors">{descriptors}</div>
        <div className="tooltipMainContent">
          <p className="tooltipTitle">{mainItem.title}</p>
          {desc}
        </div>
        {separator}
        <ul className="addContent">{_additionalContent}</ul>
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

export default StoreItemTooltip;
