import React, { useEffect, useRef } from "react";
import { marked } from "marked";
import Prism from "prismjs";
import { quizReadyEvent } from "../../../../../events/WebComponentCustomEvents";
import { scratchblocksInit } from "../../../../../utils/scratchblocks";

const markdownRenderer = new marked.Renderer();
markdownRenderer.link = function (data) {
  return `<a href="${data.href}" target="_blank" rel="noreferrer"
    }">${data.text}</a>`;
};
marked.setOptions({ renderer: markdownRenderer });

const getStepHtml = (step) => {
  if (step.content !== undefined) {
    return step.content;
  }
  return marked.parse(step.markdown_content ?? "");
};

const applySyntaxHighlighting = (container) => {
  const codeElements = container.querySelectorAll(
    ".language-python, .language-html, .language-css, .language-javascript",
  );

  codeElements.forEach((element) => {
    if (window.syntaxHighlight) {
      window.syntaxHighlight.highlightElement(element);
    } else {
      Prism.highlightElement(element);
    }
  });
};

const InstructionsStep = ({
  className,
  step,
  isQuiz = false,
  isScratchProject = false,
  language,
}) => {
  const stepContent = useRef();

  useEffect(() => {
    Prism.manual = true;
    if (Prism.plugins.NormalizeWhitespace) {
      Prism.plugins.NormalizeWhitespace.setDefaults({
        "remove-indent": false,
        "remove-initial-line-feed": true,
        "left-trim": false,
      });
      Prism.hooks.add("before-sanity-check", function (env) {
        if (!env.code) return;

        // Remove multiple leading blank lines (empty or whitespace-only)
        env.code = env.code.replace(/^(?:\s*\n)+/, "");
      });
    }
  }, []);

  useEffect(() => {
    if (!stepContent.current || !step) return;

    stepContent.current.parentElement?.scrollTo({ top: 0 });
    stepContent.current.innerHTML = getStepHtml(step);
    applySyntaxHighlighting(stepContent.current);

    if (isScratchProject) {
      scratchblocksInit(language, stepContent.current);
    }
    if (isQuiz) {
      document.dispatchEvent(quizReadyEvent);
    }
  }, [step, isQuiz, isScratchProject, language]);

  return <div className={className} ref={stepContent} />;
};

export default InstructionsStep;
