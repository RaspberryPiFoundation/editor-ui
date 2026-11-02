import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import DesignSystemButton from "../../DesignSystemButton/DesignSystemButton";
import FriendlyErrorMessage from "../FriendlyErrorMessage/FriendlyErrorMessage";
import BadgeQuestionMarkIcon from "../../../assets/icons/badge_question_mark.svg";
import LoadingSpinnerIcon from "../../../assets/icons/loading_spinner.svg";
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

// The help shown under the raw Python error, one step at a time, following the
// pilot's scaffolded structure (see LEVELS in utils/aiHelp/prompts.js):
//
//   1. The friendly summary, and a "Need more help?" button.
//   2. The button shows "Generating hint" until the first words arrive.
//   3. Once there are words to show, the button morphs into a separate AI
//      card: its label fades out, the card's subtitle fades in, and then the
//      specific hint types in, the card growing to fit. The card is kept apart
//      from the summary so it is always clear which words came from a model and
//      which were written by people.
//   4. A small "Explain more" button at the foot of the card asks for the
//      detailed explanation. It morphs the same way, in place: it fades out
//      and the explanation types in as the next paragraph, with no heading.
//      That is the last step, so no button follows it.
//
// The disclaimer sits under whichever of the button or card is showing.
// With no copydeck match the button shows straight under the raw error, and
// the first answer explains the error before hinting - the learner has seen
// nothing.

// Model output rendered as React elements from parsed blocks, never as HTML -
// the text is untrusted, so nothing here goes near dangerouslySetInnerHTML.
//
// Highlighted words reuse the friendly error message's `pfem__*` classes, so
// a variable, file or line looks the same in both cards. The library wraps a
// line in a span and everything else in code, so this does too.
const Span = ({ span }) => {
  if (span.code) {
    return (
      <code className={`ai-error-help__inline-code pfem__${span.highlight}`}>
        {span.text}
      </code>
    );
  }
  if (span.highlight === "line") {
    return <span className="pfem__line">{span.text}</span>;
  }
  if (span.highlight) {
    return <code className={`pfem__${span.highlight}`}>{span.text}</code>;
  }
  return span.text;
};

const Answer = ({ text, terms }) => (
  <>
    {parseAnswer(text, terms).map((block, index) =>
      block.type === "code" ? (
        <pre className="ai-error-help__code" key={index}>
          <code>{block.content}</code>
        </pre>
      ) : (
        <p className="ai-error-help__answer" key={index}>
          {block.spans.map((span, spanIndex) => (
            <Span span={span} key={spanIndex} />
          ))}
        </p>
      ),
    )}
  </>
);

// How long each step of the button-to-card morph takes. Kept in step with the
// transitions in AiErrorHelp.scss.
const FADE_OUT_MS = 150;
const FADE_IN_MS = 250;

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

// Steps through the morph once there is text to show:
//   button   - the "Need more help?" / "Generating hint" button
//   fading   - the button's label and spinner fade out, its outline goes
//   subtitle - the card's subtitle fades in, with no text under it yet
//   text     - the hint types in
// The explanation has no subtitle, so it goes straight from fading to text.
const useMorphPhase = (hasText, { subtitle = true } = {}) => {
  const [phase, setPhase] = useState("button");

  useEffect(() => {
    if (phase === "button" && hasText) {
      setPhase(prefersReducedMotion() ? "text" : "fading");
    }
  }, [phase, hasText]);

  useEffect(() => {
    const next = subtitle
      ? { fading: "subtitle", subtitle: "text" }[phase]
      : { fading: "text" }[phase];
    if (!next) {
      return undefined;
    }
    const timer = setTimeout(
      () => setPhase(next),
      phase === "fading" ? FADE_OUT_MS : FADE_IN_MS,
    );
    return () => clearTimeout(timer);
  }, [phase, subtitle]);

  return phase;
};

// Reveals `text` a few characters a frame, so it types in at an even pace
// rather than in the lumps the model streams it in. It speeds up when it falls
// behind, so a burst of tokens never leaves it far adrift of the model.
const useTypedText = (text, enabled) => {
  const [length, setLength] = useState(0);
  const target = text?.length ?? 0;

  useEffect(() => {
    if (!enabled || length >= target) {
      return undefined;
    }
    if (prefersReducedMotion()) {
      setLength(target);
      return undefined;
    }
    const frame = requestAnimationFrame(() =>
      setLength((current) =>
        Math.min(
          target,
          current + Math.max(1, Math.ceil((target - current) / 12)),
        ),
      ),
    );
    return () => cancelAnimationFrame(frame);
  }, [enabled, length, target]);

  return enabled && text ? text.slice(0, length) : "";
};

// Tracks the rendered height of an element, so its parent can animate to it.
// CSS cannot transition to an `auto` height, which is what a card growing
// around streamed text has.
const useMeasuredHeight = () => {
  const ref = useRef(null);
  const [height, setHeight] = useState(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") {
      return undefined;
    }
    const observer = new ResizeObserver(() =>
      setHeight(element.getBoundingClientRect().height),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, height];
};

// The names the friendly error message highlights. With no copydeck match
// there is no trace, but a NameError still names its variable in the message.
const highlightTerms = ({ friendlyError, error, errorDetails }) => ({
  name:
    friendlyError?.trace?.name ||
    error?.match(/name '([^']+)' is not defined/)?.[1] ||
    null,
  file: errorDetails?.file || friendlyError?.trace?.file || null,
});

const AiErrorHelp = () => {
  const { t } = useTranslation();
  const settings = useContext(SettingsContext);
  const error = useSelector((state) => state.editor.error);
  const friendlyError = useSelector((state) => state.editor.friendlyError);
  const projectComponents = useSelector(
    (state) => state.editor.project?.components,
  );
  const errorDetails = useSelector((state) => state.editor.errorDetails);

  // One finished answer per step - "hint", then "explanation" - and the one
  // currently streaming, if any.
  const [answers, setAnswers] = useState({});
  const [streaming, setStreaming] = useState(null);
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

  const firstLevel = friendlyError?.html ? "hint" : "explainAndHint";
  const isStreaming = streaming !== null;
  // Waiting on the model with nothing to show yet - a button's loading state.
  const isGenerating = (step) => streaming?.step === step && !streaming.text;
  const textFor = (step) =>
    answers[step]?.text ??
    (streaming?.step === step ? streaming.text || null : null);
  const hintText = textFor("hint");
  const explanationText = textFor("explanation");
  const terms = highlightTerms({ friendlyError, error, errorDetails });

  const phase = useMorphPhase(Boolean(hintText));
  const typedHint = useTypedText(hintText, phase === "text");
  const hintDone = Boolean(answers.hint) && typedHint === answers.hint.text;
  const morePhase = useMorphPhase(Boolean(explanationText), {
    subtitle: false,
  });
  const typedExplanation = useTypedText(explanationText, morePhase === "text");
  const explanationDone =
    Boolean(answers.explanation) &&
    typedExplanation === answers.explanation.text;
  const [morphContentRef, morphHeight] = useMeasuredHeight();

  const askModel = useCallback(
    async (step) => {
      if (abortRef.current) {
        return;
      }
      const model = ollamaModel();
      const controller = new AbortController();
      abortRef.current = controller;
      setFailure(null);
      setStreaming({ step, text: "" });

      let accumulated = "";
      try {
        const { text, truncated } = await streamChat({
          url: ollamaUrl(),
          model,
          signal: controller.signal,
          messages: buildMessages({
            level: step === "hint" ? firstLevel : "explanation",
            // The explanation is asked as a follow-up to the hint, so the
            // model can see what it already said and not repeat it.
            previousTurn: step === "explanation" ? answers.hint : undefined,
            components: projectComponents,
            error,
            friendlyError,
            erroringFile: errorDetails?.file,
          }),
          onToken: (token) => {
            accumulated += token;
            setStreaming({ step, text: accumulated });
          },
        });
        // The model writes the fix out regardless of instruction, so it is
        // withheld here rather than trusted to the prompt.
        setAnswers((current) => ({
          ...current,
          [step]: { model, ...withheldFix(text), truncated },
        }));
      } catch (caught) {
        if (caught?.kind === OLLAMA_ERROR_KINDS.aborted) {
          return;
        }
        // Keep whatever arrived before the failure - a half answer is still
        // more use to the learner than an error on its own. With nothing at all
        // the button stays, so the learner can try again.
        if (accumulated) {
          setAnswers((current) => ({
            ...current,
            [step]: { model, ...withheldFix(accumulated), truncated: false },
          }));
        }
        setFailure(caught?.kind ?? OLLAMA_ERROR_KINDS.server);
      } finally {
        setStreaming(null);
        abortRef.current = null;
      }
    },
    [
      firstLevel,
      answers.hint,
      projectComponents,
      error,
      friendlyError,
      errorDetails,
    ],
  );

  // Text arriving ends isGenerating a render before the morph leaves the
  // button phase, so each button stays loading until it has faded out.
  const buttonLoading = isGenerating("hint") || Boolean(hintText);
  const buttonLabel = buttonLoading
    ? t("output.aiHelp.generating")
    : t("output.aiHelp.ask");
  const moreLoading = isGenerating("explanation") || Boolean(explanationText);
  const moreLabel = moreLoading
    ? t("output.aiHelp.generatingMore")
    : t("output.aiHelp.explainMore");
  const model = answers.hint?.model ?? ollamaModel();

  const metaLines = (answer) => (
    <>
      {answer?.withheld ? (
        <p className="ai-error-help__meta">{t("output.aiHelp.fixWithheld")}</p>
      ) : null}
      {answer?.truncated ? (
        <p className="ai-error-help__meta">{t("output.aiHelp.truncated")}</p>
      ) : null}
    </>
  );

  return (
    <>
      <FriendlyErrorMessage />

      {aiHelpAvailable() ? (
        <div
          className={`ai-error-help ai-error-help--${settings.fontSize}`}
          role="status"
          aria-live="polite"
          aria-busy={isStreaming}
        >
          {/* One element throughout, so the button can turn into the card
              in place. It draws the button's outline itself, and its height
              is animated to follow its content. */}
          <div
            className={`ai-error-help__morph ai-error-help__morph--${phase}`}
            style={
              morphHeight === null ? undefined : { blockSize: morphHeight }
            }
            // Which model answered. The prototype is compared across models
            // in several tabs, so it is kept to hand without being in the
            // design: hover the card, or inspect it in a screenshot's DOM.
            title={phase === "button" ? undefined : model}
            data-model={model}
          >
            <div className="ai-error-help__morph-content" ref={morphContentRef}>
              {phase === "button" || phase === "fading" ? (
                <DesignSystemButton
                  className={`ai-error-help__button${
                    buttonLoading ? " ai-error-help__button--generating" : ""
                  }`}
                  type="secondary"
                  fill
                  text={buttonLabel}
                  title={buttonLabel}
                  // The design system Button defaults aria-label to "", which
                  // would otherwise leave this button with no accessible name.
                  aria-label={buttonLabel}
                  icon={
                    buttonLoading ? (
                      <LoadingSpinnerIcon className="ai-error-help__spinner" />
                    ) : undefined
                  }
                  // DesignSystemButton reverses the row, so "right" lands the
                  // spinner before the label, where the design has it.
                  iconPosition="right"
                  onClick={() => askModel("hint")}
                />
              ) : (
                <div className="ai-error-help__card">
                  <div className="ai-error-help__subtitle">
                    <BadgeQuestionMarkIcon className="ai-error-help__icon" />
                    <p className="ai-error-help__title">
                      {t("output.aiHelp.title")}
                    </p>
                  </div>
                  {/* Model output is rendered as plain text on purpose: it is
                      untrusted, and partial markdown looks broken mid-stream. */}
                  {typedHint ? <Answer text={typedHint} terms={terms} /> : null}
                  {hintDone ? metaLines(answers.hint) : null}

                  {hintDone ? (
                    <div
                      className={`ai-error-help__more ai-error-help__more--${morePhase}`}
                    >
                      {morePhase === "button" || morePhase === "fading" ? (
                        <DesignSystemButton
                          className="ai-error-help__more-button"
                          type="secondary"
                          size="small"
                          text={moreLabel}
                          title={moreLabel}
                          aria-label={moreLabel}
                          icon={
                            moreLoading ? (
                              <LoadingSpinnerIcon className="ai-error-help__spinner" />
                            ) : undefined
                          }
                          iconPosition="right"
                          onClick={() => askModel("explanation")}
                        />
                      ) : (
                        <>
                          {typedExplanation ? (
                            <Answer text={typedExplanation} terms={terms} />
                          ) : null}
                          {explanationDone
                            ? metaLines(answers.explanation)
                            : null}
                        </>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {failure ? (
            <p className="ai-error-help__failure">
              {t(`output.aiHelp.failure.${failure}`)}
            </p>
          ) : null}

          <p className="ai-error-help__disclaimer">
            {t("output.aiHelp.disclaimer")}{" "}
            {/* Placeholder until there is a page to link to. */}
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a href="#" onClick={(event) => event.preventDefault()}>
              {t("output.aiHelp.learnMore")}
            </a>
          </p>
        </div>
      ) : null}
    </>
  );
};

export default AiErrorHelp;
