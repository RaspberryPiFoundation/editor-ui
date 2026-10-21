import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import BadgeQuestionMarkIcon from "../../../assets/icons/badge_question_mark.svg";
import SyncIcon from "../../../assets/icons/sync.svg";
import { SettingsContext } from "../../../utils/settings";
import {
  aiHelpAvailable,
  ollamaModel,
  ollamaUrl,
} from "../../../utils/aiHelp/config";
import { buildMessages } from "../../../utils/aiHelp/buildPrompt";
import { questionsFor } from "../../../utils/aiHelp/cannedQuestions";
import { parseAnswer, withheldFix } from "../../../utils/aiHelp/formatAnswer";
import {
  OLLAMA_ERROR_KINDS,
  streamChat,
} from "../../../utils/aiHelp/ollamaClient";
import "../../../assets/stylesheets/AiErrorHelp.scss?inline";

// Concept 2: canned questions. The friendly summary and the copydeck's `why`
// above this are always visible. Below them the learner picks one of a few
// questions we have written for this kind of error, instead of typing their
// own, and the model answers that question. The question asked becomes a label
// above its answer; the ones not yet asked stay available underneath.

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

// Shown until the first token arrives. The placeholder line widths are from the
// design and only suggest the shape of an answer.
const Loading = ({ label }) => (
  <>
    <p className="ai-error-help__loading">
      <SyncIcon />
      <span>{label}</span>
    </p>
    <div className="ai-error-help__skeleton" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </div>
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

  // One entry per question asked: { id, key, text, withheld, truncated,
  // failure }. `text` stays null until the answer has finished streaming.
  const [turns, setTurns] = useState([]);
  const [streamingText, setStreamingText] = useState(null);
  // A request that failed before anything came back. Its question goes back
  // with the others, so the failure is shown on its own.
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

  const isStreaming = streamingText !== null;

  const ask = useCallback(
    async ({ id, key }) => {
      const updateTurn = (changes) =>
        setTurns((previous) =>
          previous.map((turn) =>
            turn.id === id ? { ...turn, ...changes } : turn,
          ),
        );

      const controller = new AbortController();
      abortRef.current = controller;
      setFailure(null);
      setTurns((previous) => [...previous, { id, key, text: null }]);
      setStreamingText("");

      let accumulated = "";
      try {
        const { text, truncated } = await streamChat({
          url: ollamaUrl(),
          model: ollamaModel(),
          signal: controller.signal,
          messages: buildMessages({
            level: "question",
            question: t(key),
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
        // Enforced rather than trusted: the models write the fix out regardless
        // of instruction, and none of these questions asks for it.
        updateTurn({ ...withheldFix(text), truncated });
      } catch (caught) {
        if (caught?.kind === OLLAMA_ERROR_KINDS.aborted) {
          return;
        }
        const kind = caught?.kind ?? OLLAMA_ERROR_KINDS.server;
        if (accumulated) {
          // Keep whatever arrived before the failure - a half answer is still
          // more use to the learner than an error on its own.
          updateTurn({ ...withheldFix(accumulated), failure: kind });
        } else {
          setTurns((previous) => previous.filter((turn) => turn.id !== id));
          setFailure(kind);
        }
      } finally {
        setStreamingText(null);
        abortRef.current = null;
      }
    },
    [t, projectComponents, error, friendlyError, errorDetails],
  );

  if (!aiHelpAvailable()) {
    return null;
  }

  const askedIds = turns.map((turn) => turn.id);
  const remaining = questionsFor(errorDetails?.type).filter(
    ({ id }) => !askedIds.includes(id),
  );

  return (
    <div
      className={`ai-error-help ai-error-help--${settings.fontSize}`}
      aria-busy={isStreaming}
    >
      <p className="ai-error-help__heading">
        <BadgeQuestionMarkIcon />
        <span>{t("output.aiHelp.heading")}</span>
      </p>

      <div className="ai-error-help__turns" role="status" aria-live="polite">
        {turns.map((turn) => (
          <React.Fragment key={turn.id}>
            <p className="ai-error-help__asked">{t(turn.key)}</p>
            <div className="ai-error-help__response">
              {turn.text === null ? (
                streamingText ? (
                  <Answer text={streamingText} />
                ) : (
                  <Loading label={t("output.aiHelp.loading")} />
                )
              ) : (
                <>
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
                  {turn.failure ? (
                    <p className="ai-error-help__failure">
                      {t(`output.aiHelp.failure.${turn.failure}`)}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </React.Fragment>
        ))}

        {failure ? (
          <p className="ai-error-help__failure">
            {t(`output.aiHelp.failure.${failure}`)}
          </p>
        ) : null}
      </div>

      {remaining.length > 0 ? (
        <div className="ai-error-help__questions">
          {remaining.map((question) => (
            <button
              type="button"
              className="ai-error-help__question"
              key={question.id}
              disabled={isStreaming}
              onClick={() => ask(question)}
            >
              {t(question.key)}
            </button>
          ))}
        </div>
      ) : null}

      <p className="ai-error-help__disclaimer">
        <span>{t("output.aiHelp.disclaimer")}</span>
        {/* Which model answered. The prototype is meant to be compared across
            models in several tabs, so this has to be visible in a screenshot
            without checking the URL. */}
        {turns.length > 0 ? (
          <code className="ai-error-help__model-name">{ollamaModel()}</code>
        ) : null}
      </p>
    </div>
  );
};

export default AiErrorHelp;
