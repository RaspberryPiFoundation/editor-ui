import React, { useEffect, useRef } from "react";
import SidebarPanel from "../SidebarPanel";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import ProgressBar from "./ProgressBar/ProgressBar";
import "../../../../assets/stylesheets/Instructions.scss";

const InstructionsPanel = () => {
  const steps = useSelector((state) => state.instructions.project?.steps);
  const quiz = useSelector((state) => state.instructions.quiz);

  const currentStepPosition = useSelector(
    (state) => state.instructions.currentStepPosition,
  );
  const { t } = useTranslation();
  const stepContent = useRef();

  const isQuiz = () => !!quiz.questionCount;

  useEffect(() => {
    if (isQuiz()) {
      setStepContent(quiz.questions[quiz.currentQuestion]);
    } else if (steps[currentStepPosition]) {
      setStepContent(steps[currentStepPosition].content);
    }
  }, [steps, currentStepPosition, quiz]);

  const setStepContent = (content) => {
    stepContent.current.parentElement.scrollTo({ top: 0 });
    stepContent.current.innerHTML = content;
  };

  return (
    <SidebarPanel
      heading={t("instructionsPanel.projectSteps")}
      Footer={!isQuiz() && ProgressBar}
    >
      <div className="project-instructions" ref={stepContent}></div>
    </SidebarPanel>
  );
};

export default InstructionsPanel;
