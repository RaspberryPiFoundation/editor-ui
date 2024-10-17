import React, { useContext, useEffect, useRef } from "react";
import "../../../assets/stylesheets/ErrorMessage.scss";
import { useSelector } from "react-redux";
import { SettingsContext } from "../../../utils/settings";

const ErrorMessage = () => {
  const message = useRef();
  const error = useSelector((state) => state.editor.error);
  const settings = useContext(SettingsContext);

  useEffect(() => {
    if (message.current) {
      message.current.innerHTML = error;
    }
  }, [error]);
  console.log(error);
  return error ? (
    <div className={`error-message error-message--${settings.fontSize}`}>
      <pre ref={message} className="error-message__content"></pre>
    </div>
  ) : null;
};

export default ErrorMessage;
