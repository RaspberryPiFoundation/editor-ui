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
import Button from "../../../Button/Button";
import DesignSystemButton from "../../../DesignSystemButton/DesignSystemButton";
import RemoveInstructionsModal from "../../../Modals/RemoveInstructionsModal";
import InstructionsStep from "./InstructionsStep/InstructionsStep";
import ProgressBar from "./ProgressBar/ProgressBar";

const InstructionsPanel = () => {
  const [showModal, setShowModal] = useState(false);
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

  const removeInstructions = () => {
    dispatch(setProjectInstructions(null));
    setShowModal(false);
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

  const removeStep = () => {
    dispatch(setProjectInstructions(removeStepAt(steps, currentStepPosition)));
    dispatch(setCurrentStepPosition(Math.max(currentStepPosition - 1, 0)));
  };

  const panelRef = useRef(null);

  return (
    <SidebarPanel
      defaultWidth="30vw"
      panelRef={panelRef}
      heading={t("instructionsPanel.projectSteps")}
      buttons={
        instructionsEditable
          ? hasInstructions
            ? [
                <DesignSystemButton
                  className="btn--secondary"
                  text={t("instructionsPanel.removeInstructions")}
                  onClick={() => setShowModal(true)}
                  fill={true}
                  textAlways={true}
                  small={true}
                />,
              ]
            : [
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
        hasMultipleSteps || (instructionsEditable && hasInstructions)
          ? () => (
              <>
                <ProgressBar panelRef={panelRef} />
                {instructionsEditable && (
                  <div className="instructions-panel__step-actions">
                    <Button
                      buttonText={t("instructionsPanel.addStep")}
                      title={t("instructionsPanel.addStep")}
                      onClickHandler={addStep}
                    />
                    <Button
                      buttonText={t("instructionsPanel.removeStep")}
                      title={t("instructionsPanel.removeStep")}
                      onClickHandler={removeStep}
                    />
                  </div>
                )}
              </>
            )
          : undefined
      }
    >
      <div className="project-instructions">
        {instructionsEditable ? (
          hasInstructions ? (
            <div className="c-instruction-tabs" key="instruction-tabs">
              <Tabs>
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
      {showModal && (
        <RemoveInstructionsModal
          buttons={[
            <DesignSystemButton
              type="primary"
              key="remove"
              variant="danger"
              text={t(
                "instructionsPanel.removeInstructionsModal.removeInstructions",
              )}
              onClick={removeInstructions}
            />,
            <DesignSystemButton
              type="secondary"
              key="close"
              text={t("instructionsPanel.removeInstructionsModal.close")}
              onClick={() => setShowModal(false)}
            />,
          ]}
          isOpen={showModal}
          setShowModal={setShowModal}
        />
      )}
    </SidebarPanel>
  );
};

export default InstructionsPanel;
