import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import "../../../assets/stylesheets/FriendlyErrorMessage.scss?inline";
import DOMPurify from "dompurify";
import DesignSystemButton from "../../DesignSystemButton/DesignSystemButton";

// The pre-written `why` lives in the same card as the summary and is revealed
// in place. It is only offered when the parent passes `onShowDetail`, so the
// card still works on its own without the help flow around it.
const FriendlyErrorMessage = ({ detailShown = false, onShowDetail }) => {
  const { t } = useTranslation();
  const friendlyError = useSelector((state) => state.editor.friendlyError);

  const friendlyErrorHtml = friendlyError?.html
    ? DOMPurify.sanitize(friendlyError.html)
    : null;
  const detailHtml =
    onShowDetail && friendlyError?.detailHtml
      ? DOMPurify.sanitize(friendlyError.detailHtml)
      : null;

  if (!friendlyErrorHtml) {
    return null;
  }

  const explainLabel = t("output.aiHelp.explainWhy");

  return (
    <div className="friendly-error-message">
      <div
        className="friendly-error-message__content"
        dangerouslySetInnerHTML={{ __html: friendlyErrorHtml }}
      />
      {detailHtml && detailShown ? (
        <div
          className="friendly-error-message__content friendly-error-message__detail"
          dangerouslySetInnerHTML={{ __html: detailHtml }}
        />
      ) : null}
      {detailHtml && !detailShown ? (
        <DesignSystemButton
          className="friendly-error-message__button"
          type="secondary"
          size="small"
          text={explainLabel}
          title={explainLabel}
          // The design system Button defaults aria-label to "", which would
          // otherwise leave this button with no accessible name at all.
          aria-label={explainLabel}
          onClick={onShowDetail}
        />
      ) : null}
    </div>
  );
};

export default FriendlyErrorMessage;
