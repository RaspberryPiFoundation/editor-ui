import React, { useEffect, useRef } from "react";
import SidebarPanel from "../SidebarPanel";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import ProgressBar from "./ProgressBar/ProgressBar";
import "../../../../assets/stylesheets/Instructions.scss";

const InstructionsPanel = () => {
  const steps = useSelector((state) => state.instructions.project.steps);
  const currentStepPosition = useSelector(
    (state) => state.instructions.currentStepPosition,
  );
  const { t } = useTranslation();
  const stepContent = useRef();

  useEffect(() => {
    if (steps[currentStepPosition]) {
      stepContent.current.parentElement.scrollTo({ top: 0 });
      stepContent.current.innerHTML = steps[currentStepPosition].content;
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
