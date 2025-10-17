import React from "react";
import { Button } from "@raspberrypifoundation/design-system-react";

const ToastCloseButton = ({ closeToast }) => {
  return (
    <Button type="tertiary" onClick={closeToast} icon="close" size="small" />
  );
};

export default ToastCloseButton;
