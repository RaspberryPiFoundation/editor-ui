import React from "react";
import { Button } from "@raspberrypifoundation/design-system-react";
import classNames from "classnames";
import "../../assets/stylesheets/DesignSystemButton.scss";

const DesignSystemButton = ({ className, fill = false, ...props }) => (
  <Button
    className={classNames("btn", className, {
      "rpf-button--fill": fill,
      "rpf-button--fit": !fill,
    })}
    {...props}
  />
);

export default DesignSystemButton;
