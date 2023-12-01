import React, { useEffect, useRef } from "react";
import SidebarPanel from "../SidebarPanel";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import ProgressBar from "./ProgressBar/ProgressBar";
import "../../../../assets/stylesheets/Instructions.scss";
import "prismjs/plugins/highlight-keywords/prism-highlight-keywords.js";
import "prismjs/plugins/line-highlight/prism-line-highlight";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import "prismjs/plugins/line-highlight/prism-line-highlight.css";

const InstructionsPanel = () => {
  const steps = useSelector((state) => state.instructions.project.steps);
  const currentStepPosition = useSelector(
    (state) => state.instructions.currentStepPosition,
  );
  const { t } = useTranslation();
  const stepContent = useRef();

  const applySyntaxHighlighting = (container) => {
    const codeElements = container.querySelectorAll(".language-python");

    codeElements.forEach((element) => {
      window.Prism.highlightElement(element);
    });
  };

  useEffect(() => {
    if (steps[currentStepPosition]) {
      stepContent.current.parentElement.scrollTo({ top: 0 });
      stepContent.current.innerHTML = steps[currentStepPosition].content;
      applySyntaxHighlighting(stepContent.current);
    }
  }, [steps, currentStepPosition]);

  return (
    <SidebarPanel
      heading={t("instructionsPanel.projectSteps")}
      Footer={ProgressBar}
    >
      <div className="project-instructions" ref={stepContent}></div>
    </SidebarPanel>
  );
};

export default InstructionsPanel;
