import React, { useContext } from "react";
import "../../../assets/stylesheets/ErrorMessage.scss";
import { useSelector } from "react-redux";
import DOMPurify from "dompurify";
import { SettingsContext } from "../../../utils/settings";
import CancelFillIcon from "../../../assets/icons/cancel_FILL.svg";
import FriendlyErrorMessage from "../FriendlyErrorMessage/FriendlyErrorMessage";

const ErrorMessage = () => {
  const error = useSelector((state) => state.editor.error);
  const friendlyError = useSelector((state) => state.editor.friendlyError);
  const settings = useContext(SettingsContext);

<<<<<<< 1448-and-ui-branches-combined
  useEffect(() => {
    if (message.current) {
      message.current.innerHTML = error;
    }
  }, [error]);

  return error ? (
    <div className="error-message">
      <div
        className={`error-message__python error-message__python--${settings.fontSize}`}
      >
        <CancelFillIcon />
        <pre ref={message} className="error-message__error" />
      </div>
      <FriendlyErrorMessage />
=======
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
>>>>>>> main
    </div>
  ) : null;
};

export default ErrorMessage;
