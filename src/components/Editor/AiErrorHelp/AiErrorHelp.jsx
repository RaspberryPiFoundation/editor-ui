import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";
import { Tag } from "@raspberrypifoundation/design-system-react";
import DesignSystemButton from "../../DesignSystemButton/DesignSystemButton";
import InfoIcon from "../../../assets/icons/info.svg";
import SparkleIcon from "../../../assets/icons/sparkle.svg";
import { SettingsContext } from "../../../utils/settings";
import {
  aiHelpAvailable,
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

// The escalating half of the "levels of learner support" ladder. The raw error
// and the friendly summary above this are always visible; each click here adds
// one more rung, only when the learner asks for it.
//
// PRE_WRITTEN comes from the friendly-error copydeck and is human-reviewed, so
// it always goes before anything a model says. The model rungs only exist when
// an Ollama URL is configured.
const PRE_WRITTEN = "prewritten";

const buildLadder = ({ hasPreWritten, hasModel }) => {
  const rungs = [];
  if (hasPreWritten) {
    rungs.push(PRE_WRITTEN);
  }
  if (hasModel) {
    // With no pre-written explanation the learner has seen nothing but the raw
    // Python error, so the model has to start by explaining rather than
    // hinting. This is the case the copydeck does not cover.
    if (!hasPreWritten) {
      rungs.push("explain");
    }
    rungs.push("hint", "solve");
  }
  return rungs;
};

// Only the last rung is allowed to hand over code. Earlier rungs are enforced
// rather than trusted: the models write the fix out regardless of instruction,
// and if they do there is no reason for the learner to click any further.
const applyLevelPolicy = (level, text) => {
  if (level === "solve") {
    return { text: text.trim(), withheld: false };
  }
  return withheldFix(text);
};

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

  const [step, setStep] = useState(0);
  const [turns, setTurns] = useState([]);
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

  const detailHtml = friendlyError?.detailHtml;
  const ladder = buildLadder({
    hasPreWritten: Boolean(detailHtml),
    hasModel: aiHelpAvailable(),
  });
  const nextRung = ladder[step];
  const isStreaming = streamingText !== null;

  const askModel = useCallback(
    async (level) => {
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
            previousTurn: turns[turns.length - 1],
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
        setTurns((previous) => [
          ...previous,
          { level, model, ...applyLevelPolicy(level, text), truncated },
        ]);
      } catch (caught) {
        if (caught?.kind === OLLAMA_ERROR_KINDS.aborted) {
          return;
        }
        // Keep whatever arrived before the failure - a half answer is still
        // more use to the learner than an error on its own.
        if (accumulated) {
          setTurns((previous) => [
            ...previous,
            {
              level,
              ...applyLevelPolicy(level, accumulated),
              truncated: false,
            },
          ]);
        } else {
          // Nothing came back, so this rung was not really spent. Offer it
          // again rather than moving the learner on to the next one - that is
          // what the failure copy invites them to do.
          setStep((previous) => Math.max(0, previous - 1));
        }
        setFailure(caught?.kind ?? OLLAMA_ERROR_KINDS.server);
      } finally {
        setStreamingText(null);
        abortRef.current = null;
      }
    },
    [turns, projectComponents, error, friendlyError, errorDetails],
  );

  const onEscalate = () => {
    setStep(step + 1);
    if (nextRung !== PRE_WRITTEN) {
      askModel(nextRung);
    }
  };

  if (ladder.length === 0) {
    return null;
  }

  const askLabel = nextRung ? t(`output.aiHelp.ask.${nextRung}`) : null;
  const preWrittenShown = ladder[0] === PRE_WRITTEN && step > 0;
  const modelUsed = turns.length > 0 || isStreaming || failure;

  return (
    <div
      className={`ai-error-help ai-error-help--${settings.fontSize}`}
      role="status"
      aria-live="polite"
      aria-busy={isStreaming}
    >
      {preWrittenShown ? (
        <div
          className="ai-error-help__prewritten"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(detailHtml) }}
        />
      ) : null}

      {modelUsed ? (
        <div className="ai-error-help__model">
          <p className="ai-error-help__notice">
            <Tag text={t("output.aiHelp.tag")} variant="information" />
            <span>{t("output.aiHelp.notice")}</span>
            {/* Which model answered. The prototype is meant to be compared
                across models in several tabs, so this has to be visible in a
                screenshot without checking the URL. */}
            <code className="ai-error-help__model-name">{ollamaModel()}</code>
          </p>

          {turns.map((turn, index) => (
            // Model output is rendered as plain text on purpose: it is
            // untrusted, and partial markdown looks broken mid-stream.
            <React.Fragment key={`${turn.level}-${index}`}>
              <Answer text={turn.text} />
              {turn.withheld ? (
                <p className="ai-error-help__meta">
                  {t("output.aiHelp.fixWithheld")}
                </p>
              ) : null}
              {turn.truncated ? (
                <p className="ai-error-help__meta">
                  {t("output.aiHelp.truncated")}
                </p>
              ) : null}
            </React.Fragment>
          ))}

          {isStreaming ? (
            streamingText ? (
              <Answer text={streamingText} />
            ) : (
              <p className="ai-error-help__answer">
                <span className="ai-error-help__thinking">
                  {t("output.aiHelp.thinking")}
                </span>
              </p>
            )
          ) : null}

          {failure ? (
            <p className="ai-error-help__failure">
              {t(`output.aiHelp.failure.${failure}`)}
            </p>
          ) : null}
        </div>
      ) : null}

      {nextRung ? (
        <div className="ai-error-help__actions">
          <DesignSystemButton
            className="ai-error-help__button"
            type="secondary"
            size="small"
            text={askLabel}
            title={askLabel}
            // The design system Button defaults aria-label to "", which would
            // otherwise leave this button with no accessible name at all.
            aria-label={askLabel}
            // SVG rather than a Material Symbols name: the icon font is only
            // registered at document level by the host (see
            // docs/ErrorHelpEscalation.md), so a name string renders as the
            // literal word inside the shadow DOM.
            icon={nextRung === PRE_WRITTEN ? <InfoIcon /> : <SparkleIcon />}
            iconPosition="right"
            disabled={isStreaming}
            onClick={onEscalate}
          />
        </div>
      ) : null}
    </div>
  );
};

export default AiErrorHelp;
