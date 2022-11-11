import { toast } from "react-toastify";
import { TickIcon } from "../Icons";

const bottomCenterSettings = {
  position: toast.POSITION.BOTTOM_CENTER,
  autoClose: 3000,
  className: 'toast--bottom-center__message',
  closeButton: false,
  hideProgressBar: true
}

export const showSavedMessage = (t) => {
  toast(t('notifications.projectSaved'), {
    ...bottomCenterSettings,
    icon: TickIcon
  });
}

export const showRemixedMessage = (t) => {
  toast(t('notifications.projectRemixed'), {
    ...bottomCenterSettings,
    icon: TickIcon
  });
}
