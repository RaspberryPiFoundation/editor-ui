import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@raspberrypifoundation/design-system-react";
import "../../../assets/stylesheets/AiErrorMessage.scss?inline";
import { Trans, useTranslation } from "react-i18next";
import BadgeQuestionMarkIcon from "../../../assets/icons/badge_question_mark.svg";
import SettingsIcon from "../../../assets/icons/settings.svg";
import { openAiHintSettings } from "../../../redux/EditorSlice";
import ApiCallHandler from "../../../utils/apiCallHandler";
import pollAiHint from "../../../utils/pollAiHint";
import { getAiHintLinkComponents } from "../../../utils/aiHintLinks";
import {
  aiHintLearnMoreLinkClickedEvent,
  aiHintRequestedEvent,
  aiHintTurnOffLinkClickedEvent,
} from "../../../events/WebComponentCustomEvents";

export const MIN_LOADING_MS = 500;

const AiErrorMessage = () => {
  const errorDetails = useSelector((state) => state.editor.errorDetails);
  const projectIdentifier = useSelector(
    (state) => state.editor.project?.identifier,
  );
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

  // Aborted when the error changes or the component unmounts, which stops
  // polling and tells a pending request that the user has moved on.
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setHint("");
    setFailed(false);
    setLoading(false);

    return () => controller.abort();
  }, [errorDetails]);

  // Showing the hint removes the button that had focus, so move focus to the result.
  const resultRef = useRef(null);
  const showResult = Boolean(hint || failed);

  useEffect(() => {
    if (showResult) resultRef.current?.focus();
  }, [showResult]);

  const handleButtonClick = async () => {
    const code =
      projectCode?.find((c) => c.name === "main" && c.extension === "py")
        ?.content ?? "";

    const { signal } = abortControllerRef.current;
    const isStale = () => signal.aborted;

    setLoading(true);
    setFailed(false);

    const minLoadingTime = new Promise((resolve) =>
      setTimeout(resolve, MIN_LOADING_MS),
    );
    try {
      const { createAiHint, getAiHint } = ApiCallHandler({
        reactAppApiEndpoint,
      });
      const requestHint = async () => {
        const { data } = await createAiHint(
          {
            message: errorDetails.message,
            trace: errorDetails.trace,
            runtime: errorDetails.runtime,
            code,
          },
          accessToken,
        );
        if (!data?.id) throw new Error("No hint id");
        return await pollAiHint(data.id, {
          getAiHint: (id, options) => getAiHint(id, accessToken, options),
          signal,
        });
      };
      const [hintText] = await Promise.all([requestHint(), minLoadingTime]);
      if (isStale()) return;
      setHint(hintText);
      document.dispatchEvent(
        aiHintRequestedEvent({
          projectIdentifier,
          errorDetails,
          outcome: "shown",
        }),
      );
    } catch {
      await minLoadingTime;
      if (isStale()) return;
      setFailed(true);
      document.dispatchEvent(
        aiHintRequestedEvent({
          projectIdentifier,
          errorDetails,
          outcome: "failed",
        }),
      );
    } finally {
      if (!isStale()) setLoading(false);
    }
  };

  const handleTurnOffClick = () => {
    dispatch(openAiHintSettings());
    document.dispatchEvent(
      aiHintTurnOffLinkClickedEvent({ projectIdentifier, errorDetails }),
    );
  };

  const handleLearnMoreClick = () => {
    document.dispatchEvent(
      aiHintLearnMoreLinkClickedEvent({
        projectIdentifier,
        source: "errorMessage",
      }),
    );
  };

  return (
    <div className="ai-error-message">
      {showResult && (
        <div className="ai-error-message__hint" ref={resultRef} tabIndex={-1}>
          <p className="ai-error-message__hint-heading">
            <BadgeQuestionMarkIcon aria-hidden="true" />
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
            components={getAiHintLinkComponents({
              onLearnMoreClick: handleLearnMoreClick,
            })}
          />
        </p>
        <button
          type="button"
          className="ai-error-message__turn-off"
          onClick={handleTurnOffClick}
        >
          <SettingsIcon aria-hidden="true" />
          {t("output.aiErrorMessages.turnOff")}
        </button>
      </div>
    </div>
  );
};

export default AiErrorMessage;
