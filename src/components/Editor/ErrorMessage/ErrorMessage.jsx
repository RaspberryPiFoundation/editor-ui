import React, { useContext } from "react";
import "../../../assets/stylesheets/ErrorMessage.scss";
import { useSelector } from "react-redux";
import DOMPurify from "dompurify";
import { SettingsContext } from "../../../utils/settings";
import CancelFillIcon from "../../../assets/icons/cancel_FILL.svg";
import FriendlyErrorMessage from "../FriendlyErrorMessage/FriendlyErrorMessage";

const ErrorMessage = () => {
  const error = useSelector((state) => state.editor.error);
  const settings = useContext(SettingsContext);

  return error ? (
    <div className="error-message">
      <div
        className={`error-message__python error-message__python--${settings.fontSize}`}
      >
        <CancelFillIcon />
        <pre
          className="error-message__error"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(error) }}
        />
      </div>
      <FriendlyErrorMessage />
    </div>
  ) : null;
};

export default ErrorMessage;
