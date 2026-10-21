import React, { useContext } from "react";
import "../../../assets/stylesheets/ErrorMessage.scss?inline";
import { useSelector } from "react-redux";
import DOMPurify from "dompurify";
import { SettingsContext } from "../../../utils/settings";
import CancelFillIcon from "../../../assets/icons/cancel_FILL.svg";
import AiErrorHelp from "../AiErrorHelp/AiErrorHelp";

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
      {/* Renders the friendly explanation and the AI help below it. Keyed on
          the error so a new error starts the help over and abandons any
          response still streaming for the previous one. */}
      <AiErrorHelp key={error} />
    </div>
  ) : null;
};

export default ErrorMessage;
