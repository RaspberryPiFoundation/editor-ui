import React, { useContext } from "react";
import "../../../assets/stylesheets/ErrorMessage.scss?inline";
import { useSelector } from "react-redux";
import DOMPurify from "dompurify";
import { SettingsContext } from "../../../utils/settings";
import CancelFillIcon from "../../../assets/icons/cancel_FILL.svg";
import FriendlyErrorMessage from "../FriendlyErrorMessage/FriendlyErrorMessage";
import AiErrorMessage from "../AiErrorMessage/AiErrorMessage";
import { useTranslation } from "react-i18next";
import useIsOnline from "../../../hooks/useIsOnline";

const ErrorMessage = () => {
  const { t, i18n } = useTranslation();

  const error = useSelector((state) => state.editor.error);
  const aiErrorsEnabled = useSelector((state) => state.editor.aiErrorsEnabled);
  const accessToken = useSelector((state) => state.auth?.user?.access_token);
  const friendlyError = useSelector((state) => state.editor.friendlyError);
  const settings = useContext(SettingsContext);
  const isOnline = useIsOnline();

  const showAiHint =
    isOnline &&
    aiErrorsEnabled &&
    accessToken &&
    friendlyError?.html &&
    i18n.language?.startsWith("en");

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
      {showAiHint && (
        <>
          <AiErrorMessage />
          {/* Todo: Add link here */}
          <p className="error-message__hint">
            {t("output.errors.aiErrorsHint")}
          </p>
        </>
      )}
    </div>
  ) : null;
};

export default ErrorMessage;
