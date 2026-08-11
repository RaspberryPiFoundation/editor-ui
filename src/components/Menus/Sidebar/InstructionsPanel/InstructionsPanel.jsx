/* eslint-disable jsx-a11y/anchor-has-content */
// This is disabled because the empty anchor tag is used for translation and will have content when rendered.

import React, { useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import SidebarPanel from "../SidebarPanel";

import PlusIcon from "../../../../assets/icons/plus.svg";
import demoInstructions from "../../../../assets/markdown/demoInstructions.md?raw";
import "../../../../assets/stylesheets/Instructions.scss?inline";
import { setProjectInstructions } from "../../../../redux/EditorSlice";
import {
  selectInstructionSteps,
  setCurrentStepPosition,
} from "../../../../redux/InstructionsSlice";
import {
  insertStepAfter,
  removeStepAt,
  updateStepMarkdown,
} from "../../../../utils/instructionSteps";
import populateMarkdownTemplate from "../../../../utils/populateMarkdownTemplate";
import DesignSystemButton from "../../../DesignSystemButton/DesignSystemButton";
import RemoveInstructionStepModal from "../../../Modals/RemoveInstructionStepModal";
import InstructionsStep from "./InstructionsStep/InstructionsStep";
import ProgressBar from "./ProgressBar/ProgressBar";
import BinIcon from "../../../../assets/icons/bin.svg";

const InstructionsPanel = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const onEditTab = tabIndex === 0;
  const [showRemoveStepModal, setShowRemoveStepModal] = useState(false);
  const instructionsEditable = useSelector(
    (state) => state.editor?.instructionsEditable,
  );
  const project = useSelector((state) => state.editor?.project);
  const steps = useSelector(selectInstructionSteps);
  const dispatch = useDispatch();
  const currentStepPosition = useSelector(
    (state) => state.instructions.currentStepPosition,
  );
  const { t, i18n } = useTranslation();

  const numberOfSteps = steps?.length || 0;

  const hasInstructions = steps && steps.length > 0;
  const hasMultipleSteps = numberOfSteps > 1;
  const isScratchProject = project?.project_type === "code_editor_scratch";

  const currentStep = steps[currentStepPosition];

  const addInstructions = () => {
    const translatedInstructions = populateMarkdownTemplate(
      demoInstructions,
      t,
    );
    dispatch(setProjectInstructions(translatedInstructions));
  };

  const onStepMarkdownChange = (e) => {
    dispatch(
      setProjectInstructions(
        updateStepMarkdown(steps, currentStepPosition, e.target.value),
      ),
    );
  };

  const addStep = () => {
    dispatch(
      setProjectInstructions(
        insertStepAfter(
          steps,
          currentStepPosition,
          t("instructionsPanel.newStepDefaultContent"),
        ),
      ),
    );
    dispatch(setCurrentStepPosition(currentStepPosition + 1));
  };

  const confirmRemoveStep = () => {
    dispatch(setProjectInstructions(removeStepAt(steps, currentStepPosition)));
    dispatch(setCurrentStepPosition(Math.max(currentStepPosition - 1, 0)));
    setShowRemoveStepModal(false);
  };

  const panelRef = useRef(null);

  return (
    <SidebarPanel
      defaultWidth="30vw"
      panelRef={panelRef}
      heading={t("instructionsPanel.projectSteps")}
      buttons={
        instructionsEditable && !hasInstructions
          ? [
              <DesignSystemButton
                className="btn--primary"
                icon={<PlusIcon />}
                text={t("instructionsPanel.emptyState.addInstructions")}
                onClick={addInstructions}
                fill={true}
                textAlways={true}
                small={true}
              />,
            ]
          : []
      }
      Footer={
        hasInstructions && (hasMultipleSteps || onEditTab)
          ? () => <ProgressBar panelRef={panelRef} />
          : undefined
      }
    >
      <div className="project-instructions">
        {instructionsEditable ? (
          hasInstructions ? (
            <div className="c-instruction-tabs" key="instruction-tabs">
              <Tabs
                selectedIndex={tabIndex}
                onSelect={(index) => setTabIndex(index)}
              >
                <TabList>
                  <Tab>{t("instructionsPanel.edit")}</Tab>
                  <Tab>{t("instructionsPanel.view")}</Tab>
                </TabList>
                <TabPanel>
                  <textarea
                    data-testid="instructionTextarea"
                    value={steps[currentStepPosition]?.markdown_content ?? ""}
                    onChange={onStepMarkdownChange}
                  />
                </TabPanel>
                <TabPanel>
                  <InstructionsStep
                    className="project-instructions"
                    step={currentStep}
                    isScratchProject={isScratchProject}
                    language={i18n.language}
                  />
                </TabPanel>
              </Tabs>
              {onEditTab && (
                <div className="instructions-panel__step-actions">
                  <DesignSystemButton
                    type="secondary"
                    className="btn btn--secondary instructions-panel__add-step-button"
                    text={t("instructionsPanel.addStep")}
                    icon={<PlusIcon />}
                    iconPosition="right"
                    onClick={addStep}
                  />
                  <DesignSystemButton
                    type="secondary"
                    className="btn btn--secondary btn--danger instructions-panel__remove-step-button"
                    title={t("instructionsPanel.removeStep")}
                    icon={<BinIcon />}
                    onClick={() => setShowRemoveStepModal(true)}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="project-instructions__empty">
              <p className="project-instructions__empty-text">
                {t("instructionsPanel.emptyState.purpose")}
              </p>
              <p className="project-instructions__empty-text">
                {t("instructionsPanel.emptyState.location")}
              </p>
              <p className="project-instructions__empty-text">
                <Trans
                  i18nKey="instructionsPanel.emptyState.markdown"
                  components={[
                    <a
                      href="https://www.markdownguide.org/cheat-sheet/"
                      target="_blank"
                      rel="noreferrer"
                    />,
                  ]}
                />
              </p>
              <p className="project-instructions__empty-text">
                {t("instructionsPanel.emptyState.edits")}
              </p>
            </div>
          )
        ) : (
          <InstructionsStep
            className="project-instructions__content"
            key="instruction-content"
            step={currentStep}
            isScratchProject={isScratchProject}
            language={i18n.language}
          />
        )}
      </div>
      {showRemoveStepModal && (
        <RemoveInstructionStepModal
          buttons={[
            <DesignSystemButton
              type="primary"
              key="remove"
              variant="danger"
              text={t("instructionsPanel.removeStepModal.removeStep")}
              onClick={confirmRemoveStep}
            />,
            <DesignSystemButton
              type="secondary"
              key="cancel"
              text={t("instructionsPanel.removeStepModal.cancel")}
              onClick={() => setShowRemoveStepModal(false)}
            />,
          ]}
          isOpen={showRemoveStepModal}
          setShowModal={setShowRemoveStepModal}
        />
      )}
    </SidebarPanel>
  );
};

export default InstructionsPanel;
