import React, { useContext, useEffect, useRef } from "react";
import "../../../assets/stylesheets/ErrorMessage.scss";
import { useSelector } from "react-redux";
import DOMPurify from "dompurify";
import { SettingsContext } from "../../../utils/settings";
import CancelFillIcon from "../../../assets/icons/cancel_FILL.svg";
import FriendlyErrorMessage from "../FriendlyErrorMessage/FriendlyErrorMessage";

const ErrorMessage = () => {
  const message = useRef();
  const error = useSelector((state) => state.editor.error);
  const friendlyError = useSelector((state) => state.editor.friendlyError);
  const settings = useContext(SettingsContext);

  // To be removed when ready
  const fem = false;

  useEffect(() => {
    if (message.current) {
      message.current.innerHTML = error;
    }
  }, [error]);

  const friendlyErrorHtml = friendlyError?.html
    ? DOMPurify.sanitize(friendlyError.html)
    : null;

  return error ? (
    <div className={`error-message error-message--${settings.fontSize}`}>
      <CancelFillIcon />
      <pre ref={message} className="error-message__content" />
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
