import React from "react";
import { toast } from "react-toastify";
import InfoIcon from "../assets/icons/info.svg";
import TickIcon from "../assets/icons/tick.svg";
import i18n from "./i18n";
import Button from "../components/Button/Button";
import CloseIcon from "./CloseIcon";

const CloseButton = ({ closeToast }) => {
  return (
    <Button
      ButtonIcon={CloseIcon}
      onClickHandler={closeToast}
      title={i18n.t("notifications.close")}
      label={i18n.t("notifications.close")}
    />
  );
};

const bottomCenterSettings = {
  position: toast.POSITION.BOTTOM_CENTER,
  autoClose: 3000,
  className: "toast--bottom-center__message",
  closeButton: false,
  containerId: "bottom-center",
  hideProgressBar: true,
};

const topCenterSettings = {
  position: toast.POSITION.TOP_CENTER,
  autoClose: 6000,
  className: "toast--top-center__message",
  closeButton: CloseButton,
  containerId: "top-center",
  hideProgressBar: true,
};

export const showSavePrompt = () => {
  toast(i18n.t("notifications.savePrompt"), {
    ...topCenterSettings,
    className: `${topCenterSettings.className} toast--info`,
    icon: InfoIcon,
  });
};

export const showLoginPrompt = () => {
  toast(i18n.t("notifications.loginPrompt"), {
    ...topCenterSettings,
    className: `${topCenterSettings.className} toast--info`,
    icon: InfoIcon,
  });
};

export const showSavedMessage = () => {
  toast(i18n.t("notifications.projectSaved"), {
    ...bottomCenterSettings,
    icon: TickIcon,
  });
};

export const showRenamedMessage = () => {
  toast(i18n.t("notifications.projectRenamed"), {
    ...bottomCenterSettings,
    icon: TickIcon,
  });
};
