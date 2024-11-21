import React from "react";
import Button from "../../../src/components/Button/Button";

export default {
  title: "Button",
  component: Button,
};

const DefaultTemplate = ({
  className,
  buttonText,
  confirmText,
  onClickHandler,
}) => {
  return (
    <Button
      className={className}
      buttonText={buttonText}
      confirmText={confirmText}
      onClickHandler={onClickHandler}
    />
  );
};

export const Default = DefaultTemplate.bind();
Default.args = {
  className: "",
  confirmText: "Please confirm",
  onClickHandler: () => console.log("Button clicked"),
  buttonText: "Button text",
};
Default.parameters = { controls: {} };
