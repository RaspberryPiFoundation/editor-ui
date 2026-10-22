import React, { useContext } from "react";
import "../../../assets/stylesheets/ErrorMessage.scss?inline";
import { useSelector } from "react-redux";
import DOMPurify from "dompurify";
import { SettingsContext } from "../../../utils/settings";
import CancelFillIcon from "../../../assets/icons/cancel_FILL.svg";
import FriendlyErrorMessage from "../FriendlyErrorMessage/FriendlyErrorMessage";
import { useTranslation } from "react-i18next";

const ErrorMessage = () => {
  const { t } = useTranslation();

  const error = useSelector((state) => state.editor.error);
  const settings = useContext(SettingsContext);
  const aiErrorsEnabled = useSelector((state) => state.editor.aiErrorsEnabled);

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
      {aiErrorsEnabled && <p>{t("output.errors.aiComingSoon")}</p>}
    </div>
  ) : null;
};

export default ErrorMessage;
