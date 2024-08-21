import React, { useContext } from "react";
import "../../../assets/stylesheets/ErrorMessage.scss";
import { useSelector } from "react-redux";
import { SettingsContext } from "../../../utils/settings";

const ErrorMessage = () => {
  const error = useSelector((state) => state.editor.error);
  const settings = useContext(SettingsContext);

  return error ? (
    <div className={`error-message error-message--${settings.fontSize}`}>
      <pre className="error-message__content">{error}</pre>
    </div>
  ) : null;
};

export default ErrorMessage;
