import Tippy from "@tippyjs/react";
import React from "react";
import { IDescriptionTooltip } from "../types/interface/Tooltip";

// Tooltips for descriptions
function DescriptionTooltip({
  element,
  title,
  additionalContent = [],
  placement = "top",
}: IDescriptionTooltip) {
  // add separator between additional content and title/desc
  // if there is additional content
  const separator =
    additionalContent.length > 0 ? <div className="separator" /> : null;

  const _additionalContent = additionalContent.map((item) => {
    return <li key={`tooltipAddItem${title}${item}`}>{item}</li>;
  });

  const tooltipContent = (
    <>
      <div className="tooltipMainContent">
        <p className="tooltipTitle">{title}</p>
      </div>
      {separator}
      <ul className="addContent">{_additionalContent}</ul>
    </>
  );

  return (
    <Tippy
      content={tooltipContent}
      className="tooltip"
      arrow={false}
      animation={"shift-away"}
      placement={placement as any}
    >
      {element}
    </Tippy>
  );
}

export default DescriptionTooltip;
