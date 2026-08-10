import React, { useEffect, useRef } from "react";
import { processEditorProject } from "@raspberrypifoundation/rpf-markdown-core";
import Prism from "../../../../../utils/prism";
import { quizReadyEvent } from "../../../../../events/WebComponentCustomEvents";
import { scratchblocksInit } from "../../../../../utils/scratchblocks";

const getStepHtml = (step) => {
  if (step.content !== undefined) {
    return step.content;
  }
  return processEditorProject(step.markdown_content ?? "");
};

const applySyntaxHighlighting = (container) => {
  const codeElements = container.querySelectorAll(
    ".language-python, .language-html, .language-css, .language-javascript",
  );

  codeElements.forEach((element) => {
    Prism.highlightElement(element);
  });
};

const applyExternalLinkAttributes = (container) => {
  container.querySelectorAll("a[href]").forEach((link) => {
    if (link.getAttribute("href").startsWith("#")) return;
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noreferrer");
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
    if (!stepContent.current || !step) return;

    stepContent.current.parentElement?.scrollTo({ top: 0 });
    stepContent.current.innerHTML = getStepHtml(step);
    applySyntaxHighlighting(stepContent.current);
    applyExternalLinkAttributes(stepContent.current);

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
