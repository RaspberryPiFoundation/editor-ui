import React, { useEffect } from "react";
import { Button } from "@raspberrypifoundation/design-system-react";
import "../../assets/stylesheets/DesignSystemButton.scss";

const DesignSystemButton = (props) => {
  useEffect(() => {
    console.log("This is definitely the DesignSystemButton!");
  });
  return <Button {...props} />;
};

export default DesignSystemButton;
