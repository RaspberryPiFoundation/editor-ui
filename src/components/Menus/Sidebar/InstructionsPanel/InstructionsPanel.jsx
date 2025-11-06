/* eslint-disable jsx-a11y/anchor-has-content */
// This is disabled because the empty anchor tag is used for translation and will have content when rendered.
import React, { useEffect, useRef, useMemo, useState } from "react";
import SidebarPanel from "../SidebarPanel";
import { Trans, useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";

import ProgressBar from "./ProgressBar/ProgressBar";
import "../../../../assets/stylesheets/Instructions.scss";
import { quizReadyEvent } from "../../../../events/WebComponentCustomEvents";
import { setCurrentStepPosition } from "../../../../redux/InstructionsSlice";
import DesignSystemButton from "../../../DesignSystemButton/DesignSystemButton";
import { setProjectInstructions } from "../../../../redux/EditorSlice";
import demoInstructions from "../../../../assets/markdown/demoInstructions.md";
import RemoveInstructionsModal from "../../../Modals/RemoveInstructionsModal";
import Prism from "prismjs";
import populateMarkdownTemplate from "../../../../utils/populateMarkdownTemplate";

const InstructionsPanel = () => {
  useEffect(() => {
    // prism and prism plugin config
    Prism.manual = true;
    if (Prism.plugins.NormalizeWhitespace) {
      Prism.plugins.NormalizeWhitespace.setDefaults({
        "remove-indent": false,
        "remove-initial-line-feed": true,
        "left-trim": false,
      });
      Prism.hooks.add("before-sanity-check", function (env) {
        if (!env.code) return;

        // Remove multiple leading blank lines (empty or whitespace-only)
        env.code = env.code.replace(/^(?:\s*\n)+/, "");
      });
    }
  }, []);
  const [showModal, setShowModal] = useState(false);
  const instructionsEditable = useSelector(
    (state) => state.editor?.instructionsEditable,
  );
  const project = useSelector((state) => state.editor?.project);
  const steps = useSelector((state) => state.instructions.project?.steps);
  const quiz = useSelector((state) => state.instructions?.quiz);
  const dispatch = useDispatch();
  const currentStepPosition = useSelector(
    (state) => state.instructions.currentStepPosition,
  );
  const { t } = useTranslation();
  const stepContent = useRef();

  const [isQuiz, setIsQuiz] = useState(false);
  const [instructionsTab, setInstructionsTab] = useState(0);

  const quizCompleted = useMemo(() => {
    return quiz?.currentQuestion === quiz?.questionCount;
  }, [quiz]);

  const numberOfSteps = useSelector(
    (state) => state.instructions.project?.steps?.length || 0,
  );

  const hasInstructions = steps && steps.length > 0;
  const hasMultipleSteps = numberOfSteps > 1;

  const applySyntaxHighlighting = (container) => {
    const codeElements = container.querySelectorAll(
      ".language-python, .language-html, .language-css, .language-javascript",
    );

    codeElements.forEach((element) => {
      if (window.syntaxHighlight) {
        window.syntaxHighlight.highlightElement(element);
      } else {
        Prism.highlightElement(element);
      }
    });
  };

  useEffect(() => {
    const stepIsQuizAndHasQuestions = () => {
      return (
        !quizCompleted &&
        !!quiz?.questionCount &&
        typeof steps[currentStepPosition]?.knowledgeQuiz === "string"
      );
    };
    stepIsQuizAndHasQuestions() ? setIsQuiz(true) : setIsQuiz(false);
  }, [quiz, steps, currentStepPosition, quizCompleted]);

  useEffect(() => {
    const setStepContent = (content) => {
      if (stepContent.current) {
        stepContent.current?.parentElement.scrollTo({ top: 0 });
        stepContent.current.innerHTML = content;
        applySyntaxHighlighting(stepContent.current);
      }
    };
    if (isQuiz && !quizCompleted) {
      setStepContent(quiz.questions[quiz.currentQuestion]);
      document.dispatchEvent(quizReadyEvent);
    } else if (hasInstructions && steps[currentStepPosition]) {
      setStepContent(steps[currentStepPosition].content);
    }
  }, [
    hasInstructions,
    steps,
    currentStepPosition,
    quiz,
    quizCompleted,
    isQuiz,
    instructionsTab,
  ]);

  useEffect(() => {
    if (quizCompleted && isQuiz) {
      dispatch(
        setCurrentStepPosition(
          Math.min(currentStepPosition + 1, numberOfSteps - 1),
        ),
      );
    }
  }, [quizCompleted, currentStepPosition, numberOfSteps, dispatch, isQuiz]);

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

  const onChange = (e) => {
    dispatch(setProjectInstructions(e.target.value));
  };

  return (
    <SidebarPanel
      defaultWidth="30vw"
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
                  icon="add"
                  text={t("instructionsPanel.emptyState.addInstructions")}
                  onClick={addInstructions}
                  fill={true}
                  textAlways={true}
                  small={true}
                />,
              ]
          : null
      }
      {...{ Footer: hasMultipleSteps && ProgressBar }}
    >
      <div className="project-instructions">
        {instructionsEditable ? (
          hasInstructions ? (
            <div className="c-instruction-tabs">
              <Tabs
                onSelect={(index) => {
                  setInstructionsTab(index);
                }}
              >
                <TabList>
                  <Tab>{t("instructionsPanel.edit")}</Tab>
                  <Tab>{t("instructionsPanel.view")}</Tab>
                </TabList>
                <TabPanel>
                  <textarea
                    data-testid="instructionTextarea"
                    value={project.instructions}
                    onChange={onChange}
                  ></textarea>
                </TabPanel>
                <TabPanel>
                  <>
                    <div
                      className="project-instructions"
                      ref={stepContent}
                    ></div>
                  </>
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
          <div
            className="project-instructions__content"
            ref={stepContent}
          ></div>
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
