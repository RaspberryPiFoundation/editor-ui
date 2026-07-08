import React from "react";
import { useSelector } from "react-redux";
import "../../../assets/stylesheets/FriendlyErrorMessage.scss?inline";
import DOMPurify from "dompurify";

const FriendlyErrorMessage = () => {
  const friendlyError = useSelector((state) => state.editor.friendlyError);

  const friendlyErrorHtml = friendlyError?.html
    ? DOMPurify.sanitize(friendlyError.html)
    : null;

  return friendlyErrorHtml ? (
    <div className="friendly-error-message">
      <div
        className="friendly-error-message__content"
        dangerouslySetInnerHTML={{ __html: friendlyErrorHtml }}
      />
    </div>
  ) : null;
};

export default FriendlyErrorMessage;
