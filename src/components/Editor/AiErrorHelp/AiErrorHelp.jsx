import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import DesignSystemButton from "../../DesignSystemButton/DesignSystemButton";
import FriendlyErrorMessage from "../FriendlyErrorMessage/FriendlyErrorMessage";
import BadgeQuestionMarkIcon from "../../../assets/icons/badge_question_mark.svg";
import SyncIcon from "../../../assets/icons/sync.svg";
import { SettingsContext } from "../../../utils/settings";
import {
  aiHelpAvailable,
  aiHelpLearnMoreUrl,
  ollamaModel,
  ollamaUrl,
} from "../../../utils/aiHelp/config";
import { buildMessages } from "../../../utils/aiHelp/buildPrompt";
import { parseAnswer, withheldFix } from "../../../utils/aiHelp/formatAnswer";
import {
  OLLAMA_ERROR_KINDS,
  streamChat,
} from "../../../utils/aiHelp/ollamaClient";
import "../../../assets/stylesheets/AiErrorHelp.scss?inline";

// The help shown under the raw Python error, one step at a time:
//
//   1. The friendly summary, with "Explain why this happened".
//   2. The pre-written `why` in the same card, and a separate AI card offering
//      a hint. The AI card is kept apart so it is always clear which words came
//      from a model and which were written by people.
//   3. "Generating a hint with AI…" while the model streams.
//   4. The AI explanation, with a disclaimer.
//
// With no pre-written `why` the AI card shows straight away, and asks the
// model to explain rather than hint - the learner has only seen the summary.

// Model output rendered as React elements from parsed blocks, never as HTML -
// the text is untrusted, so nothing here goes near dangerouslySetInnerHTML.
const Answer = ({ text }) => (
  <>
    {parseAnswer(text).map((block, index) =>
      block.type === "code" ? (
        <pre className="ai-error-help__code" key={index}>
          <code>{block.content}</code>
        </pre>
      ) : (
        <p className="ai-error-help__answer" key={index}>
          {block.spans.map((span, spanIndex) =>
            span.code ? (
              <code className="ai-error-help__inline-code" key={spanIndex}>
                {span.text}
              </code>
            ) : (
              <React.Fragment key={spanIndex}>{span.text}</React.Fragment>
            ),
          )}
        </p>
      ),
    )}
  </>
);

const AiErrorHelp = () => {
  const { t } = useTranslation();
  const settings = useContext(SettingsContext);
  const error = useSelector((state) => state.editor.error);
  const friendlyError = useSelector((state) => state.editor.friendlyError);
  const projectComponents = useSelector(
    (state) => state.editor.project?.components,
  );
  const errorDetails = useSelector((state) => state.editor.errorDetails);

  const [detailShown, setDetailShown] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [streamingText, setStreamingText] = useState(null);
  const [failure, setFailure] = useState(null);
  const abortRef = useRef(null);

  // Abandon any in-flight response when this unmounts. The component is keyed on
  // the error message, so running the code again remounts it and lands here.
  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    [],
  );

  const hasPreWritten = Boolean(
    friendlyError?.html && friendlyError?.detailHtml,
  );
  const level = hasPreWritten ? "hint" : "explain";
  const showAiCard = aiHelpAvailable() && (detailShown || !hasPreWritten);
  const isStreaming = streamingText !== null;

  const askModel = useCallback(async () => {
    const model = ollamaModel();
    const controller = new AbortController();
    abortRef.current = controller;
    setFailure(null);
    setStreamingText("");

    let accumulated = "";
    try {
      const { text, truncated } = await streamChat({
        url: ollamaUrl(),
        model,
        signal: controller.signal,
        messages: buildMessages({
          level,
          components: projectComponents,
          error,
          friendlyError,
          erroringFile: errorDetails?.file,
        }),
        onToken: (token) => {
          accumulated += token;
          setStreamingText(accumulated);
        },
      });
      // The model writes the fix out regardless of instruction, so it is
      // withheld here rather than trusted to the prompt.
      setAnswer({ model, ...withheldFix(text), truncated });
    } catch (caught) {
      if (caught?.kind === OLLAMA_ERROR_KINDS.aborted) {
        return;
      }
      // Keep whatever arrived before the failure - a half answer is still more
      // use to the learner than an error on its own. With nothing at all the
      // button stays, so the learner can try again.
      if (accumulated) {
        setAnswer({ model, ...withheldFix(accumulated), truncated: false });
      }
      setFailure(caught?.kind ?? OLLAMA_ERROR_KINDS.server);
    } finally {
      setStreamingText(null);
      abortRef.current = null;
    }
  }, [level, projectComponents, error, friendlyError, errorDetails]);

  const askLabel = t(`output.aiHelp.ask.${level}`);
  const learnMoreUrl = aiHelpLearnMoreUrl();
  const modelUsed = Boolean(answer) || isStreaming;

  return (
    <>
      <FriendlyErrorMessage
        detailShown={detailShown}
        onShowDetail={() => setDetailShown(true)}
      />

      {showAiCard ? (
        <div
          className={`ai-error-help ai-error-help--${settings.fontSize}${
            isStreaming && !streamingText ? " ai-error-help--generating" : ""
          }`}
          role="status"
          aria-live="polite"
          aria-busy={isStreaming}
        >
          <div className="ai-error-help__header">
            {isStreaming ? (
              <SyncIcon className="ai-error-help__icon ai-error-help__icon--generating" />
            ) : (
              <BadgeQuestionMarkIcon className="ai-error-help__icon" />
            )}
            <p className="ai-error-help__title">
              {isStreaming
                ? t(`output.aiHelp.generating.${level}`)
                : t("output.aiHelp.title")}
            </p>
            {/* Which model answered. The prototype is meant to be compared
                across models in several tabs, so this has to be visible in a
                screenshot without checking the URL. */}
            {modelUsed ? (
              <code className="ai-error-help__model-name">
                {answer?.model ?? ollamaModel()}
              </code>
            ) : null}
            {!answer && !isStreaming ? (
              <DesignSystemButton
                className="ai-error-help__button"
                type="secondary"
                size="small"
                text={askLabel}
                title={askLabel}
                // The design system Button defaults aria-label to "", which
                // would otherwise leave this button with no accessible name.
                aria-label={askLabel}
                onClick={askModel}
              />
            ) : null}
          </div>

          {/* Model output is rendered as plain text on purpose: it is
              untrusted, and partial markdown looks broken mid-stream. */}
          {answer ? <Answer text={answer.text} /> : null}
          {isStreaming && streamingText ? (
            <Answer text={streamingText} />
          ) : null}

          {answer?.withheld ? (
            <p className="ai-error-help__meta">
              {t("output.aiHelp.fixWithheld")}
            </p>
          ) : null}
          {answer?.truncated ? (
            <p className="ai-error-help__meta">
              {t("output.aiHelp.truncated")}
            </p>
          ) : null}
          {failure ? (
            <p className="ai-error-help__failure">
              {t(`output.aiHelp.failure.${failure}`)}
            </p>
          ) : null}

          {modelUsed ? (
            <p className="ai-error-help__disclaimer">
              {t("output.aiHelp.disclaimer")}
              {learnMoreUrl ? (
                <>
                  {" "}
                  <a href={learnMoreUrl} target="_blank" rel="noreferrer">
                    {t("output.aiHelp.learnMore")}
                  </a>
                </>
              ) : null}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
};

export default AiErrorHelp;
