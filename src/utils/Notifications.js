import { toast } from "react-toastify";
import { TickIcon } from "../Icons";
import i18n from "../i18n";

const bottomCenterSettings = {
  position: toast.POSITION.BOTTOM_CENTER,
  autoClose: 3000,
  className: 'toast--bottom-center__message',
  closeButton: false,
  hideProgressBar: true
}

export const showSavedMessage = () => {
  toast(i18n.t('notifications.projectSaved'), {
    ...bottomCenterSettings,
    icon: TickIcon
  });
}

export const showRemixedMessage = () => {
  toast(i18n.t('notifications.projectRemixed'), {
    ...bottomCenterSettings,
    icon: TickIcon
  });
}
