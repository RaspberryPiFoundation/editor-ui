import React from "react";
import Button from "../components/Button/Button";
import { CloseIcon } from "../Icons";

const ToastCloseButton = ({ closeToast }) => {
  return (
    <Button
      className="btn btn--tertiary"
      onClickHandler={closeToast}
      ButtonIcon={() => <CloseIcon scaleFactor={0.75} />}
    />
  );
};

export default ToastCloseButton;
