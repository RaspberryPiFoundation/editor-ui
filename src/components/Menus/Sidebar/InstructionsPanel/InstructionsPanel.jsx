import React, { useEffect, useRef } from "react";
import SidebarPanel from "../SidebarPanel";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import ProgressBar from "./ProgressBar/ProgressBar";
import "../../../../assets/stylesheets/Instructions.scss";
import "prismjs/plugins/highlight-keywords/prism-highlight-keywords.js";

const InstructionsPanel = () => {
  const steps = useSelector((state) => state.instructions.project.steps);
  const currentStepPosition = useSelector(
    (state) => state.instructions.currentStepPosition,
  );
  const { t } = useTranslation();
  const stepContent = useRef();

  const applySyntaxHighlighting = (container) => {
    const elements = container.querySelectorAll(".language-python");
    console.log("There are", elements.length, "relevant elements to highlight");

    elements.forEach((element) => {
      if (element.innerText !== "print") {
        console.log(element.innerText);
        window.Prism.highlightElement(element);
      }
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
