import React from "react";
import classNames from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentStepPosition } from "../../../../../redux/InstructionsSlice";
import ChevronLeft from "../../../../../assets/icons/chevron_left.svg";
import ChevronRight from "../../../../../assets/icons/chevron_right.svg";
import Button from "../../../../Button/Button";

import "../../../../../assets/stylesheets/ProgressBar.scss?inline";
import { useTranslation } from "react-i18next";

const ProgressBar = ({ panelRef, onAddStep }) => {
  const numberOfSteps = useSelector(
    (state) => state.instructions.project.steps.length,
  );
  const currentStepPosition = useSelector(
    (state) => state.instructions.currentStepPosition,
  );

  const dispatch = useDispatch();
  const { t } = useTranslation();

  // Authors need to know where they are even before they have split their
  // instructions into steps, so the counter is always shown to them.
  const isAuthoring = Boolean(onAddStep);
  const hasMultipleSteps = numberOfSteps > 1;

  const goToNextStep = () => {
    panelRef?.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    dispatch(
      setCurrentStepPosition(
        Math.min(currentStepPosition + 1, numberOfSteps - 1),
      ),
    );
  };

  const goToPreviousStep = () => {
    panelRef?.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    dispatch(setCurrentStepPosition(Math.max(currentStepPosition - 1, 0)));
  };

  return (
    <>
      <div className="progress-bar">
        <Button
          className={"btn--secondary btn--small"}
          onClickHandler={goToPreviousStep}
          ButtonIcon={ChevronLeft}
          disabled={currentStepPosition === 0}
          title={t("instructionsPanel.previousStep")}
        />
        <div className="progress-container">
          <p
            className={classNames("step-counter", {
              "step-counter--always": isAuthoring,
            })}
          >
            {isAuthoring && !hasMultipleSteps
              ? t("instructionsPanel.noSteps")
              : t("instructionsPanel.stepCounter", {
                  currentStep: currentStepPosition + 1,
                  totalSteps: numberOfSteps,
                })}
          </p>
          {hasMultipleSteps && (
            <progress max={numberOfSteps - 1} value={currentStepPosition} />
          )}
        </div>

        <Button
          className={"btn--secondary btn--small"}
          onClickHandler={goToNextStep}
          ButtonIcon={ChevronRight}
          disabled={currentStepPosition === numberOfSteps - 1}
          title={t("instructionsPanel.nextStep")}
        />

        {isAuthoring && (
          <Button
            className={"btn--secondary btn--small btn--add-step"}
            onClickHandler={onAddStep}
            buttonText={t("instructionsPanel.addStep")}
            title={t("instructionsPanel.addStep")}
          />
        )}
      </div>
    </>
  );
};

export default ProgressBar;
