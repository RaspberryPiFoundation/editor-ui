import React, { useContext, useEffect, useRef } from "react";
import "../../../assets/stylesheets/ErrorMessage.scss";
import { useSelector } from "react-redux";
import { SettingsContext } from "../../../utils/settings";
import CancelFillIcon from "../../../assets/icons/cancel_FILL.svg";
import FriendlyErrorMessage from "../FriendlyErrorMessage/FriendlyErrorMessage";

const ErrorMessage = () => {
  const message = useRef();
  const error = useSelector((state) => state.editor.error);
  const settings = useContext(SettingsContext);

  // To be removed when ready
  const fem = false;

  useEffect(() => {
    if (message.current) {
      message.current.innerHTML = error;
    }
  }, [error]);
  return error ? (
    <div className={`error-message error-message--${settings.fontSize}`}>
      <div className="error-message__python">
        <CancelFillIcon />
        <pre ref={message} className="error-message__error"></pre>
      </div>
      {fem && (
        <div className="error-message__fem">
          <FriendlyErrorMessage />
        </div>
      )}
    </div>
  ) : null;
};

export default ErrorMessage;
