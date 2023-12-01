import React, { useEffect, useRef } from "react";
import SidebarPanel from "../SidebarPanel";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { setCurrentQuestion } from "../../../../redux/reducers/instructionsReducers";
import ProgressBar from "./ProgressBar/ProgressBar";
import "../../../../assets/stylesheets/Instructions.scss";
import { current } from "@reduxjs/toolkit";

const InstructionsPanel = () => {
  const steps = useSelector((state) => state.instructions.project.steps);
  const questions = useSelector((state) => state.instructions.quiz?.questions);

  const currentStepPosition = useSelector(
    (state) => state.instructions.currentStepPosition,
  );
  const currentQuestion = useSelector(
    (state) => state.instructions.currentQuestion,
  );
  const { t } = useTranslation();
  const stepContent = useRef();

  useEffect(() => {
    if (steps[currentStepPosition]) {
      setStepContent(steps[currentStepPosition].content);
    }
  }, [steps, currentStepPosition]);

  useEffect(() => {
    if (questions) {
      setStepContent(questions[currentQuestion]);
    }
  }, [questions, currentQuestion]);

  const setStepContent = (content) => {
    stepContent.current.parentElement.scrollTo({ top: 0 });
    stepContent.current.innerHTML = content;
  };

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
