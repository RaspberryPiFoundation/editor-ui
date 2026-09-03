import React, { useEffect, useRef } from "react";
import { processEditorProject } from "@raspberrypifoundation/rpf-markdown-core";
import Prism from "../../../../../utils/prism";
import sanitiseInstructions from "../../../../../utils/sanitiseInstructions";
import { scratchblocksInit } from "../../../../../utils/scratchblocks";

const GOOGLE_DRIVE_ORIGIN = "https://drive.google.com";
const INSTRUCTION_ASSET_BASE_URL =
  "https://editor-assets.raspberrypi.org/instructions-assets";

const getStepHtml = (step) => {
  const html =
    step.content !== undefined
      ? step.content
      : processEditorProject(step.markdown_content ?? "");

  return sanitiseInstructions(html);
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

const applyMirroredInstructionImages = (container) => {
  container.querySelectorAll("img[src]").forEach((image) => {
    try {
      const sourceUrl = new URL(image.getAttribute("src"));
      const id = sourceUrl.searchParams.get("id");

      if (
        sourceUrl.origin === GOOGLE_DRIVE_ORIGIN &&
        sourceUrl.pathname === "/thumbnail" &&
        id
      ) {
        image.setAttribute(
          "src",
          `${INSTRUCTION_ASSET_BASE_URL}/${encodeURIComponent(id)}`,
        );
      }
    } catch {
      // Leave relative and malformed image sources unchanged.
    }
  });
};

const InstructionsStep = ({
  className,
  step,
  isScratchProject = false,
  language,
}) => {
  const stepContent = useRef();

  useEffect(() => {
    if (!stepContent.current || !step) return;

    stepContent.current.parentElement?.scrollTo({ top: 0 });
    stepContent.current.innerHTML = getStepHtml(step);
    applyMirroredInstructionImages(stepContent.current);
    applySyntaxHighlighting(stepContent.current);
    applyExternalLinkAttributes(stepContent.current);

    if (isScratchProject) {
      scratchblocksInit(language, stepContent.current);
    }
  }, [step, isScratchProject, language]);

  return <div className={className} ref={stepContent} />;
};

export default InstructionsStep;
