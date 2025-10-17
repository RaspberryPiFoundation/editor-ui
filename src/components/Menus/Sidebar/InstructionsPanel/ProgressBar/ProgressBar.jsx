import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentStepPosition } from "../../../../../redux/InstructionsSlice";
import { Button } from "@raspberrypifoundation/design-system-react";

import "../../../../../assets/stylesheets/ProgressBar.scss";
import { useTranslation } from "react-i18next";

const ProgressBar = () => {
  const numberOfSteps = useSelector(
    (state) => state.instructions.project.steps.length
  );
  const currentStepPosition = useSelector(
    (state) => state.instructions.currentStepPosition
  );

  const dispatch = useDispatch();
  const { t } = useTranslation();

  const goToNextStep = () => {
    dispatch(
      setCurrentStepPosition(
        Math.min(currentStepPosition + 1, numberOfSteps - 1)
      )
    );
  };

  const goToPreviousStep = () => {
    dispatch(setCurrentStepPosition(Math.max(currentStepPosition - 1, 0)));
  };

  return (
    <div className="progress-bar">
      <Button
        onClick={goToPreviousStep}
        icon="chevron_right"
        disabled={currentStepPosition === 0}
        title={t("instructionsPanel.previousStep")}
        size="small"
      />
      <progress max={numberOfSteps - 1} value={currentStepPosition}></progress>
      <Button
        onClick={goToNextStep}
        icon="chevron_right"
        disabled={currentStepPosition === numberOfSteps - 1}
        title={t("instructionsPanel.nextStep")}
        size="small"
      />
    </div>
  );
};

export default ProgressBar;
