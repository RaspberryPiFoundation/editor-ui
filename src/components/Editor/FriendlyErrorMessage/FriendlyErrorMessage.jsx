import React from "react";
import { useSelector } from "react-redux";
import "../../../assets/stylesheets/FriendlyErrorMessage.scss?inline";
import DOMPurify from "dompurify";

const FriendlyErrorMessage = () => {
  const friendlyError = useSelector((state) => state.editor.friendlyError);

  const friendlyErrorHtml = friendlyError?.html
    ? DOMPurify.sanitize(friendlyError.html)
    : null;
  const detailHtml = friendlyError?.detailHtml
    ? DOMPurify.sanitize(friendlyError.detailHtml)
    : null;

  return friendlyErrorHtml ? (
    <div className="friendly-error-message">
      <div
        className="friendly-error-message__content"
        dangerouslySetInnerHTML={{ __html: friendlyErrorHtml }}
      />
      {detailHtml ? (
        <div
          className="friendly-error-message__content friendly-error-message__detail"
          dangerouslySetInnerHTML={{ __html: detailHtml }}
        />
      ) : null}
    </div>
  ) : null;
};

export default FriendlyErrorMessage;
