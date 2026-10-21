import React, {
  useCallback,
  useContext,
  useEffect,
  useId,
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
import {
  buildCompletionMessages,
  buildQuestionMessages,
} from "../../../utils/aiHelp/buildPrompt";
import { parseAnswer, withheldFix } from "../../../utils/aiHelp/formatAnswer";
import {
  OLLAMA_ERROR_KINDS,
  chatText,
  streamChat,
} from "../../../utils/aiHelp/ollamaClient";
import "../../../assets/stylesheets/AiErrorHelp.scss?inline";

// Concept 3, "controlled prompt creation". Rather than escalating through fixed
// rungs, the learner builds their own question in two taps - a starter, then
// one of a few ways to finish it - so the model gets told what kind of help
// they want, without a free-text box a child could type anything into.
const STARTERS = ["explain", "howDoI", "whyDoes"];

// Offered when the model cannot suggest completions, so a slow or confused
// model never leaves the learner with a starter and nothing to finish it with.
// English only, like the model's own suggestions - this is a prototype.
const FALLBACK_COMPLETIONS = {
  explain: ["what this error means", "which line has the problem"],
  howDoI: ["fix this error?", "find where the problem is?"],
  whyDoes: ["this error happen?", "my code not work?"],
};

// Model output shown as a button label, so keep it to something that fits on
// one and reads as the end of a question.
const MAX_COMPLETION_CHARS = 60;

// One completion per line, as the prompt asks. Models add numbering, bullets
// and quotes regardless, so strip those rather than show them on a button.
const cleanCompletions = (starterLabel, output = "") => {
  const starterPrefix = starterLabel.toLowerCase();
  const seen = new Set();
  return output
    .split("\n")
    .map((completion) => {
      let text = completion
        .trim()
        .replace(/^(?:[-*•]|\d+[.)])\s*/, "")
        .replace(/^["'“]+|["'”]+$/g, "")
        .trim();
      // Small models often repeat the learner's words despite being told not
      // to. Strip them rather than show "How do I How do I...".
      if (text.toLowerCase().startsWith(starterPrefix)) {
        text = text.slice(starterPrefix.length).trim();
      }
      return text.replace(/^[.…\s]+/, "");
    })
    .filter((text) => {
      const key = text.toLowerCase();
      // A line ending in a colon is an introduction ("Here are three:"), not
      // a completion.
      if (
        !text ||
        text.endsWith(":") ||
        text.length > MAX_COMPLETION_CHARS ||
        seen.has(key)
      ) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .slice(0, 3);
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

const Chip = ({ selected, children, ...props }) => (
  <button
    type="button"
    className={`ai-error-help__chip${
      selected ? " ai-error-help__chip--selected" : ""
    }`}
    aria-pressed={selected}
    {...props}
  >
    {children}
  </button>
);

const LoadingBars = () => (
  <div className="ai-error-help__skeleton" aria-hidden="true">
    <span />
    <span />
    <span />
    <span />
  </div>
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

  const [starter, setStarter] = useState(null);
  const [completions, setCompletions] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [streamingText, setStreamingText] = useState(null);
  const [failure, setFailure] = useState(null);
  const abortRef = useRef(null);
  // Both runners can be mounted at once, so the heading id must be unique.
  const titleId = useId();

  // Abandon any in-flight request when this unmounts. The component is keyed on
  // the error message, so running the code again remounts it and lands here.
  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    [],
  );

  const starterLabel = (key) => t(`output.aiHelp.starter.${key}`);
  const isStreaming = streamingText !== null;

  // Only what the learner has actually been shown above this panel. The steps
  // are no longer on screen in this concept, so telling the model they were
  // would make it skip over them.
  const context = {
    components: projectComponents,
    error,
    friendlyError: friendlyError && { ...friendlyError, steps: [] },
    erroringFile: errorDetails?.file,
  };

  const startRequest = () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    return controller;
  };

  const loadCompletions = useCallback(
    async (key) => {
      const controller = startRequest();
      let suggested = [];
      try {
        const output = await chatText({
          url: ollamaUrl(),
          model: ollamaModel(),
          signal: controller.signal,
          messages: buildCompletionMessages({
            starter: starterLabel(key),
            ...context,
          }),
        });
        suggested = cleanCompletions(starterLabel(key), output);
      } catch (caught) {
        if (caught?.kind === OLLAMA_ERROR_KINDS.aborted) {
          return;
        }
        // Not worth surfacing: the fallbacks below still let the learner ask.
      }
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      setCompletions(
        suggested.length > 0 ? suggested : FALLBACK_COMPLETIONS[key],
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectComponents, error, friendlyError, errorDetails],
  );

  const ask = useCallback(
    async (question) => {
      const controller = startRequest();
      setFailure(null);
      setAnswer(null);
      setStreamingText("");

      let accumulated = "";
      try {
        const { text, truncated } = await streamChat({
          url: ollamaUrl(),
          model: ollamaModel(),
          signal: controller.signal,
          messages: buildQuestionMessages({ question, ...context }),
          onToken: (token) => {
            accumulated += token;
            setStreamingText(accumulated);
          },
        });
        setAnswer({ ...withheldFix(text), truncated });
      } catch (caught) {
        if (caught?.kind === OLLAMA_ERROR_KINDS.aborted) {
          return;
        }
        // Keep whatever arrived before the failure - a half answer is still
        // more use to the learner than an error on its own.
        if (accumulated) {
          setAnswer({ ...withheldFix(accumulated), truncated: false });
        }
        setFailure(caught?.kind ?? OLLAMA_ERROR_KINDS.server);
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setStreamingText(null);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectComponents, error, friendlyError, errorDetails],
  );

  const onStarter = (key) => {
    // Tapping the chosen starter again, before finishing the prompt, takes it
    // back. Once a question has been asked, a starter begins a new one.
    if (key === starter && !completion) {
      abortRef.current?.abort();
      setStarter(null);
      setCompletions(null);
      return;
    }
    setStarter(key);
    setCompletion(null);
    setCompletions(null);
    setAnswer(null);
    setFailure(null);
    setStreamingText(null);
    loadCompletions(key);
  };

  const onCompletion = (text) => {
    setCompletion(text);
    ask(`${starterLabel(starter)} ${text}`);
  };

  if (!aiHelpAvailable()) {
    return null;
  }

  const asked = Boolean(completion);
  const finished = asked && !isStreaming;

  const starterChips = (
    <div
      className="ai-error-help__chips"
      role="group"
      aria-label={t("output.aiHelp.starters")}
    >
      {STARTERS.map((key) => (
        <Chip key={key} selected={false} onClick={() => onStarter(key)}>
          {t(`output.aiHelp.starterOption.${key}`)}
        </Chip>
      ))}
    </div>
  );

  return (
    <section
      className={`ai-error-help ai-error-help--${settings.fontSize}`}
      aria-labelledby={titleId}
    >
      <div className="ai-error-help__header">
        <h3 className="ai-error-help__title" id={titleId}>
          <BadgeQuestionMarkIcon className="ai-error-help__title-icon" />
          {t("output.aiHelp.title")}
        </h3>
        <p className="ai-error-help__intro">{t("output.aiHelp.intro")}</p>
      </div>

      {starter ? (
        <>
          <div className="ai-error-help__chips">
            <Chip selected onClick={() => onStarter(starter)} disabled={asked}>
              {starterLabel(starter)}
            </Chip>
            {asked ? <Chip selected>{completion}</Chip> : null}
          </div>

          {!asked ? (
            completions ? (
              <div
                className="ai-error-help__chips"
                role="group"
                aria-label={t("output.aiHelp.completions")}
              >
                {completions.map((text) => (
                  <Chip
                    key={text}
                    selected={false}
                    onClick={() => onCompletion(text)}
                  >
                    {text}
                  </Chip>
                ))}
              </div>
            ) : (
              <div
                className="ai-error-help__chips ai-error-help__chips--loading"
                role="status"
                aria-label={t("output.aiHelp.loadingCompletions")}
              >
                <span />
                <span />
                <span />
              </div>
            )
          ) : null}
        </>
      ) : (
        starterChips
      )}

      {asked ? (
        <div
          className="ai-error-help__response"
          role="status"
          aria-live="polite"
          aria-busy={isStreaming}
        >
          {isStreaming && !streamingText ? (
            <>
              <p className="ai-error-help__label">
                <SyncIcon className="ai-error-help__spinner" />
                {t("output.aiHelp.loading")}
              </p>
              <LoadingBars />
            </>
          ) : (
            <>
              {/* A label, not a speaker: this should not read like a chat
                  with a person. */}
              <p className="ai-error-help__label">
                {t("output.aiHelp.responseLabel")}
              </p>
              {isStreaming ? <Answer text={streamingText} /> : null}
              {answer ? <Answer text={answer.text} /> : null}
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
            </>
          )}
          {/* Which model answered. The prototype is meant to be compared
              across models in several tabs, so this has to be visible in a
              screenshot without checking the URL. */}
          <code className="ai-error-help__model-name">{ollamaModel()}</code>
        </div>
      ) : null}

      {finished ? starterChips : null}

      <p className="ai-error-help__disclaimer">
        {t("output.aiHelp.disclaimer")}
      </p>
    </section>
  );
};

export default AiErrorHelp;
