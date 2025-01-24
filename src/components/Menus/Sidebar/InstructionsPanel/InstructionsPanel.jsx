import React, { useEffect, useRef, useMemo, useState } from "react";
import SidebarPanel from "../SidebarPanel";
import { Trans, useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import ProgressBar from "./ProgressBar/ProgressBar";
import "../../../../assets/stylesheets/Instructions.scss";
import "prismjs/plugins/highlight-keywords/prism-highlight-keywords.js";
import "prismjs/plugins/line-highlight/prism-line-highlight";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import "prismjs/plugins/line-highlight/prism-line-highlight.css";
import { quizReadyEvent } from "../../../../events/WebComponentCustomEvents";
import { setCurrentStepPosition } from "../../../../redux/InstructionsSlice";
import DesignSystemButton from "../../../DesignSystemButton/DesignSystemButton";
import { setProjectInstructions } from "../../../../redux/EditorSlice";
import demoInstructions from "../../../../assets/markdown/demoInstructions.md";
import { Link } from "react-router-dom";
import RemoveInstructionsModal from "../../../Modals/RemoveInstructionsModal";

const InstructionsPanel = () => {
  const [showModal, setShowModal] = useState(false);
  const instructionsEditable = useSelector(
    (state) => state.editor?.instructionsEditable
  );
  const project = useSelector((state) => state.editor?.project);
  const steps = useSelector((state) => state.instructions.project?.steps);
  const quiz = useSelector((state) => state.instructions?.quiz);
  const dispatch = useDispatch();
  const currentStepPosition = useSelector(
    (state) => state.instructions.currentStepPosition
  );
  const { t } = useTranslation();
  const stepContent = useRef();

  const [isQuiz, setIsQuiz] = useState(false);

  const quizCompleted = useMemo(() => {
    return quiz?.currentQuestion === quiz?.questionCount;
  }, [quiz]);

  const numberOfSteps = useSelector(
    (state) => state.instructions.project?.steps?.length || 0
  );

  const hasInstructions = steps && steps.length > 0;
  const hasMultipleSteps = numberOfSteps > 1;

  const applySyntaxHighlighting = (container) => {
    const codeElements = container.querySelectorAll(
      ".language-python, .language-html, .language-css"
    );

    codeElements.forEach((element) => {
      window.Prism.highlightElement(element);
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
  ]);

  useEffect(() => {
    if (quizCompleted && isQuiz) {
      dispatch(
        setCurrentStepPosition(
          Math.min(currentStepPosition + 1, numberOfSteps - 1)
        )
      );
    }
  }, [quizCompleted, currentStepPosition, numberOfSteps, dispatch, isQuiz]);

  const addInstructions = () => {
    dispatch(setProjectInstructions(demoInstructions));
  };

  const removeInstructions = () => {
    dispatch(setProjectInstructions(null));
    setShowModal(false);
  };

  const AddInstructionsButton = () => {
    return (
      <DesignSystemButton
        className="btn--primary"
        icon="add"
        text={t("instructionsPanel.emptyState.addInstructions")}
        onClick={addInstructions}
        fill
        textAlways
        small
      />
    );
  };

  const RemoveInstructionsButton = () => {
    return (
      <DesignSystemButton
        className="btn--secondary"
        text={t("instructionsPanel.emptyState.removeInstructions")}
        onClick={() => {
          setShowModal(true);
        }}
        fill
        textAlways
        small
      />
    );
  };

  const onChange = (e) => {
    dispatch(setProjectInstructions(e.target.value));
  };

  return (
    <SidebarPanel
      defaultWidth="30vw"
      heading={t("instructionsPanel.projectSteps")}
      Button={
        instructionsEditable
          ? hasInstructions
            ? RemoveInstructionsButton
            : AddInstructionsButton
          : null
      }
      {...{ Footer: hasMultipleSteps && ProgressBar }}
    >
      <div className="project-instructions">
        {instructionsEditable ? (
          hasInstructions ? (
            <div>
              {instructionsEditable && (
                <textarea
                  data-testid="instructionTextarea"
                  value={project.instructions}
                  onChange={onChange}
                ></textarea>
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
                    <Link
                      href="https://commonmark.org/help/"
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
                "instructionsPanel.removeInstructionsModal.removeInstructions"
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
