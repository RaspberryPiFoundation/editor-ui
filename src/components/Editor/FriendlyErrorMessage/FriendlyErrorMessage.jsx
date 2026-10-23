import React from "react";
import { useSelector } from "react-redux";
import "../../../assets/stylesheets/FriendlyErrorMessage.scss?inline";
import DOMPurify from "dompurify";
import { useTranslation } from "react-i18next";

const FriendlyErrorMessage = () => {
  const friendlyError = useSelector((state) => state.editor.friendlyError);
  const aiErrorsEnabled = useSelector((state) => state.editor.aiErrorsEnabled);
  const { t } = useTranslation();

  const friendlyErrorHtml = friendlyError?.html
    ? DOMPurify.sanitize(friendlyError.html)
    : null;

  return friendlyErrorHtml ? (
    <div className="friendly-error-message">
      <div
        className="friendly-error-message__content"
        dangerouslySetInnerHTML={{ __html: friendlyErrorHtml }}
      />
      {aiErrorsEnabled && <p>{t("output.errors.aiComingSoon")}</p>}
    </div>
  ) : null;
};

export default FriendlyErrorMessage;
