import React from "react";
import { Button } from "@raspberrypifoundation/design-system-react";
import classNames from "classnames";
import "../../assets/stylesheets/DesignSystemButton.scss?inline";

// `buttonWrapper` is the scoping hook for DesignSystemButton.scss. It must stay
// on every button rendered through this wrapper: without it none of those
// overrides apply. It deliberately does NOT carry `btn` — that belongs to the
// Editor Button (Button.jsx) alone, and applying it here was what let editor
// styles override the design system.
const DesignSystemButton = ({ className, fill = false, ...props }) => (
  <Button
    className={classNames("buttonWrapper", className, {
      "rpf-button--fill": fill && !props.iconOnly,
      "rpf-button--fit": !fill && !props.iconOnly,
    })}
    {...props}
  />
);

export default DesignSystemButton;
