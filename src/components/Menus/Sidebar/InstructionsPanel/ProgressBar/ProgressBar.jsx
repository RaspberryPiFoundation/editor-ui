import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentStepPosition } from "../../../../../redux/InstructionsSlice";
import ChevronLeft from "../../../../../assets/icons/chevron_left.svg";
import ChevronRight from "../../../../../assets/icons/chevron_right.svg";
import Button from "../../../../Button/Button";

import "../../../../../assets/stylesheets/ProgressBar.scss";
import { useTranslation } from "react-i18next";

const ProgressBar = () => {
  const numberOfSteps = useSelector(
    (state) => state.instructions.project.steps.length,
  );
  const currentStepPosition = useSelector(
    (state) => state.instructions.currentStepPosition,
  );

  const dispatch = useDispatch();
  const { t } = useTranslation();

  const goToNextStep = () => {
    dispatch(
      setCurrentStepPosition(
        Math.min(currentStepPosition + 1, numberOfSteps - 1),
      ),
    );
  };

  const goToPreviousStep = () => {
    dispatch(setCurrentStepPosition(Math.max(currentStepPosition - 1, 0)));
  };

  return (
    <>
      <p className="step-counter">{`${
        currentStepPosition + 1
      } of ${numberOfSteps}`}</p>
    <div className="progress-bar">
      <Button
        className={"btn--primary btn--small"}
        buttonOuter
        onClickHandler={goToPreviousStep}
        ButtonIcon={ChevronLeft}
        disabled={currentStepPosition === 0}
        title={t("instructionsPanel.previousStep")}
      />
      <progress max={numberOfSteps - 1} value={currentStepPosition}></progress>
      <Button
        className={"btn--primary btn--small"}
        buttonOuter
        onClickHandler={goToNextStep}
        ButtonIcon={ChevronRight}
        disabled={currentStepPosition === numberOfSteps - 1}
        title={t("instructionsPanel.nextStep")}
      />
    </div>
    </>
  );
};

export default ProgressBar;
