import React from "react";
import { useSelector } from "react-redux";
import "../../../assets/stylesheets/FriendlyErrorMessage.scss?inline";
import DOMPurify from "dompurify";

const FriendlyErrorMessage = () => {
  const friendlyError = useSelector((state) => state.editor.friendlyError);

  const friendlyErrorHtml = friendlyError?.html
    ? DOMPurify.sanitize(friendlyError.html)
    : null;
  // The copydeck's `why`, shown straight away rather than behind a button: it
  // is human-reviewed copy, so it goes ahead of anything a model says.
  const whyHtml = friendlyError?.detailHtml
    ? DOMPurify.sanitize(friendlyError.detailHtml)
    : null;

  return friendlyErrorHtml ? (
    <div className="friendly-error-message">
      <div
        className="friendly-error-message__content"
        dangerouslySetInnerHTML={{ __html: friendlyErrorHtml }}
      />
      {whyHtml ? (
        <div
          className="friendly-error-message__why"
          dangerouslySetInnerHTML={{ __html: whyHtml }}
        />
      ) : null}
    </div>
  ) : null;
};

export default FriendlyErrorMessage;
