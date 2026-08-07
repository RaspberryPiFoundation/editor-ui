/* eslint-disable jsx-a11y/anchor-has-content */
// This is disabled because the empty anchor tag is used for translation and will have content when rendered.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import SidebarPanel from "../SidebarPanel";

import Prism from "prismjs";
import PencilIcon from "../../../../assets/icons/pencil.svg";
import PlusIcon from "../../../../assets/icons/plus.svg";
import PreviewIcon from "../../../../assets/icons/preview.svg";
import demoInstructions from "../../../../assets/markdown/demoInstructions.md?raw";
import "../../../../assets/stylesheets/Instructions.scss?inline";
import { quizReadyEvent } from "../../../../events/WebComponentCustomEvents";
import { setProjectInstructions } from "../../../../redux/EditorSlice";
import { setCurrentStepPosition } from "../../../../redux/InstructionsSlice";
import {
  appendStepToInstructions,
  replaceStepMarkdown,
  splitInstructionsIntoSteps,
} from "../../../../utils/instructionSteps";
import populateMarkdownTemplate from "../../../../utils/populateMarkdownTemplate";
import { scratchblocksInit } from "../../../../utils/scratchblocks";
import DesignSystemButton from "../../../DesignSystemButton/DesignSystemButton";
import RemoveInstructionsModal from "../../../Modals/RemoveInstructionsModal";
import ProgressBar from "./ProgressBar/ProgressBar";

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
  const { t, i18n } = useTranslation();
  const stepContent = useRef();
  const goToNewStepRef = useRef(false);

  const [isQuiz, setIsQuiz] = useState(false);
  // Authors toggle between editing the current step's markdown and previewing
  // it as students will see it; editing is the starting point.
  const [isPreviewing, setIsPreviewing] = useState(false);

  const quizCompleted = useMemo(() => {
    return quiz?.currentQuestion === quiz?.questionCount;
  }, [quiz]);

  const numberOfSteps = useSelector(
    (state) => state.instructions.project?.steps?.length || 0,
  );

  const hasInstructions = steps && steps.length > 0;
  const hasMultipleSteps = numberOfSteps > 1;
  const isScratchProject = project?.project_type === "code_editor_scratch";

  // Authors always get the pagination (it is how steps are added and moved
  // between, even while editing); students only get it once there is more than
  // one step to move between.
  const isAuthoring = instructionsEditable && hasInstructions;
  const showProgressBar = isAuthoring || hasMultipleSteps;

  // The markdown for each step, as split out of the single stored document.
  const stepMarkdown = useMemo(
    () => splitInstructionsIntoSteps(project?.instructions),
    [project?.instructions],
  );
  const currentStepMarkdown = stepMarkdown[currentStepPosition] ?? "";

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
        // Editable instructions are rendered from author-supplied markdown, so
        // they may contain scratch code fences regardless of project type.
        if (isScratchProject || instructionsEditable) {
          scratchblocksInit(i18n.language, stepContent.current);
        }
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
    isPreviewing,
    isScratchProject,
    instructionsEditable,
    i18n.language,
  ]);

  // Editing can reduce the number of steps (e.g. removing a page break), so
  // keep the current step within range to avoid landing on a blank step.
  useEffect(() => {
    if (numberOfSteps > 0 && currentStepPosition > numberOfSteps - 1) {
      dispatch(setCurrentStepPosition(numberOfSteps - 1));
    }
  }, [numberOfSteps, currentStepPosition, dispatch]);

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

  // Authors only ever see the markdown for the step they are on, so edits are
  // written back into that step's section of the stored document.
  const onChange = (e) => {
    dispatch(
      setProjectInstructions(
        replaceStepMarkdown(
          project?.instructions,
          currentStepPosition,
          e.target.value,
        ),
      ),
    );
  };

  const addStep = () => {
    goToNewStepRef.current = true;
    setIsPreviewing(false);
    dispatch(
      setProjectInstructions(appendStepToInstructions(project?.instructions)),
    );
  };

  // The new step only exists once the stored document has been re-split into
  // steps, so wait for the step count to catch up before navigating to it.
  useEffect(() => {
    if (goToNewStepRef.current && numberOfSteps > 0) {
      goToNewStepRef.current = false;
      dispatch(setCurrentStepPosition(numberOfSteps - 1));
    }
  }, [numberOfSteps, dispatch]);

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
                  key="preview"
                  className="btn--primary"
                  icon={isPreviewing ? <PencilIcon /> : <PreviewIcon />}
                  text={
                    isPreviewing
                      ? t("instructionsPanel.edit")
                      : t("instructionsPanel.preview")
                  }
                  onClick={() => setIsPreviewing(!isPreviewing)}
                  fill={true}
                  textAlways={true}
                  small={true}
                />,
                <DesignSystemButton
                  key="remove"
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
                  key="add"
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
        showProgressBar
          ? () => (
              <ProgressBar
                panelRef={panelRef}
                onAddStep={isAuthoring ? addStep : undefined}
              />
            )
          : undefined
      }
    >
      <div className="project-instructions">
        {instructionsEditable ? (
          hasInstructions ? (
            isPreviewing ? (
              // Keyed so React mounts a fresh node when toggling: reusing the
              // editor's element would leave the ref pointing at it and the
              // rendered markdown would replace the textarea.
              <div
                key="preview"
                className="project-instructions__content"
                ref={stepContent}
              />
            ) : (
              <div key="editor" className="c-instruction-editor">
                <textarea
                  data-testid="instructionTextarea"
                  value={currentStepMarkdown}
                  onChange={onChange}
                />
              </div>
            )
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
          <div className="project-instructions__content" ref={stepContent} />
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
