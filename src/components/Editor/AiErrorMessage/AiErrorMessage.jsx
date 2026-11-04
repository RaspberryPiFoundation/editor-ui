import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@raspberrypifoundation/design-system-react";
import "../../../assets/stylesheets/AiErrorMessage.scss?inline";
import { useTranslation } from "react-i18next";
import BadgeQuestionMarkIcon from "../../../assets/icons/badge_question_mark.svg";
import ApiCallHandler from "../../../utils/apiCallHandler";

const AiErrorMessage = () => {
  const aiErrorsEnabled = useSelector((state) => state.editor.aiErrorsEnabled);
  const errorDetails = useSelector((state) => state.editor.errorDetails);
  const projectCode = useSelector((state) => state.editor.project?.components);
  const accessToken = useSelector((state) => state.auth?.user?.access_token);
  const reactAppApiEndpoint = useSelector(
    (state) => state.editor.reactAppApiEndpoint,
  );
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [hint, setHint] = useState("");

  useEffect(() => {
    setHint("");
    setFailed(false);
    setLoading(false);
  }, [errorDetails]);

  const handleButtonClick = async () => {
    const code =
      projectCode?.find((c) => c.name === "main" && c.extension === "py")
        ?.content ?? "";

    setLoading(true);
    setFailed(false);
    try {
      const { getAiErrorHint } = ApiCallHandler({ reactAppApiEndpoint });
      const { data } = await getAiErrorHint(
        {
          message: errorDetails.message,
          trace: errorDetails.trace,
          runtime: errorDetails.runtime,
          code,
        },
        accessToken,
      );
      setHint(data.fem);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  if (!aiErrorsEnabled || !accessToken) return null;

  return (
    <div className="ai-error-message" aria-live="polite">
      {hint ? (
        <div className="ai-error-message__hint">
          <p className="ai-error-message__hint-heading">
            <BadgeQuestionMarkIcon />
            {t("output.aiErrorMessages.aiGeneratedHint")}
          </p>
          <p className="ai-error-message__hint-text">{hint}</p>
        </div>
      ) : (
        <>
          {failed && (
            <div className="ai-error-message__hint">
              <p className="ai-error-message__hint-text">
                {t("output.aiErrorMessages.errorText")}
              </p>
            </div>
          )}
          <Button
            className="ai-error-message__button"
            loading={loading}
            loadingText={t("output.aiErrorMessages.loadingText")}
            fullWidth={true}
            onClick={handleButtonClick}
            type="secondary"
            text={t("output.aiErrorMessages.buttonText")}
          />
        </>
      )}
    </div>
  );
};

export default AiErrorMessage;
