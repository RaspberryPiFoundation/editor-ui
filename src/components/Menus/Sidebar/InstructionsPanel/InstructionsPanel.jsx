import React from "react";
import SidebarPanel from "../SidebarPanel";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const InstructionsPanel = () => {
  const steps = useSelector((state) => state.instructions.project.steps);
  const currentStepPosition = useSelector(
    (state) => state.instructions.currentStepPosition,
  );
  const { t } = useTranslation();
  return (
    <SidebarPanel heading={t("instructionsPanel.projectSteps")}>
      {steps[currentStepPosition].content}
    </SidebarPanel>
  );
};

export default InstructionsPanel;
