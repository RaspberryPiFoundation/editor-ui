import React from "react";
import Button from "../components/Button/Button";
import CloseIcon from "./CloseIcon";

const ToastCloseButton = ({ closeToast }) => {
  return (
    <Button
      className="btn--tertiary"
      onClickHandler={closeToast}
      ButtonIcon={() => <CloseIcon scaleFactor={0.75} />}
    />
  );
};

export default ToastCloseButton;
