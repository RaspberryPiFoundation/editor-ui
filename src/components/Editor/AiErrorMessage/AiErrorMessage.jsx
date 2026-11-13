import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@raspberrypifoundation/design-system-react";
import "../../../assets/stylesheets/AiErrorMessage.scss?inline";
import { Trans, useTranslation } from "react-i18next";
import BadgeQuestionMarkIcon from "../../../assets/icons/badge_question_mark.svg";
import SettingsIcon from "../../../assets/icons/settings.svg";
import { openAiHintSettings } from "../../../redux/EditorSlice";
import ApiCallHandler from "../../../utils/apiCallHandler";
import { aiHintLinkComponents } from "../../../utils/aiHintLinks";

export const MIN_LOADING_MS = 500;

const AiErrorMessage = () => {
  const errorDetails = useSelector((state) => state.editor.errorDetails);
  const projectCode = useSelector((state) => state.editor.project?.components);
  const accessToken = useSelector((state) => state.auth?.user?.access_token);
  const reactAppApiEndpoint = useSelector(
    (state) => state.editor.reactAppApiEndpoint,
  );
  const { t } = useTranslation();
  const dispatch = useDispatch();
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
    const minLoadingTime = new Promise((resolve) =>
      setTimeout(resolve, MIN_LOADING_MS),
    );
    try {
      const { getAiErrorHint } = ApiCallHandler({ reactAppApiEndpoint });
      const [{ data }] = await Promise.all([
        getAiErrorHint(
          {
            message: errorDetails.message,
            trace: errorDetails.trace,
            runtime: errorDetails.runtime,
            code,
          },
          accessToken,
        ),
        minLoadingTime,
      ]);
      if (!data?.fem) throw new Error("Empty hint");
      setHint(data.fem);
    } catch {
      await minLoadingTime;
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-error-message" aria-live="polite">
      {(hint || failed) && (
        <div className="ai-error-message__hint">
          <p className="ai-error-message__hint-heading">
            <BadgeQuestionMarkIcon />
            {t("output.aiErrorMessages.aiGeneratedHint")}
          </p>
          <p className="ai-error-message__hint-text">
            {hint || t("output.aiErrorMessages.errorText")}
          </p>
        </div>
      )}
      {!hint && (
        <Button
          className="ai-error-message__button"
          loading={loading}
          loadingText={t("output.aiErrorMessages.loadingText")}
          fullWidth={true}
          onClick={handleButtonClick}
          type="secondary"
          text={
            failed
              ? t("output.aiErrorMessages.retryButtonText")
              : t("output.aiErrorMessages.buttonText")
          }
        />
      )}
      <div className="ai-error-message__footer">
        <p className="ai-error-message__notice">
          <Trans
            i18nKey="output.aiErrorMessages.notice"
            components={aiHintLinkComponents}
          />
        </p>
        <button
          type="button"
          className="ai-error-message__turn-off"
          onClick={() => dispatch(openAiHintSettings())}
        >
          <SettingsIcon aria-hidden="true" />
          {t("output.aiErrorMessages.turnOff")}
        </button>
      </div>
    </div>
  );
};

export default AiErrorMessage;
