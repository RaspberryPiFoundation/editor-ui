import React, { useContext } from "react";
import "../../../assets/stylesheets/ErrorMessage.scss";
import { useSelector } from "react-redux";
import DOMPurify from "dompurify";
import { SettingsContext } from "../../../utils/settings";

const ErrorMessage = () => {
  const error = useSelector((state) => state.editor.error);
  const friendlyError = useSelector((state) => state.editor.friendlyError);
  const settings = useContext(SettingsContext);

  const errorHtml = DOMPurify.sanitize(error);

  const friendlyErrorHtml = friendlyError?.html
    ? DOMPurify.sanitize(friendlyError.html)
    : null;

  return error ? (
    <div className={`error-message error-message--${settings.fontSize}`}>
      <pre
        className="error-message__content"
        dangerouslySetInnerHTML={{ __html: errorHtml }}
      />
      {friendlyErrorHtml && (
        <div
          className="error-message__friendly"
          dangerouslySetInnerHTML={{ __html: friendlyErrorHtml }}
        />
      )}
    </div>
  ) : null;
};

export default ErrorMessage;
