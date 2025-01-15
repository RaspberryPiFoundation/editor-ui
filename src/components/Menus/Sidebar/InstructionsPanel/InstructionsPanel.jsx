import React, { useEffect, useRef, useMemo, useState } from "react";
import SidebarPanel from "../SidebarPanel";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import ProgressBar from "./ProgressBar/ProgressBar";
import "../../../../assets/stylesheets/Instructions.scss";
import "prismjs/plugins/highlight-keywords/prism-highlight-keywords.js";
import "prismjs/plugins/line-highlight/prism-line-highlight";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import "prismjs/plugins/line-highlight/prism-line-highlight.css";
import { quizReadyEvent } from "../../../../events/WebComponentCustomEvents";
import { setCurrentStepPosition } from "../../../../redux/InstructionsSlice";
import { setProjectInstructions } from "../../../../redux/EditorSlice";
const InstructionsPanel = () => {
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
  const [editInstructions, setEditInstructions] = useState("");

  const quizCompleted = useMemo(() => {
    return quiz?.currentQuestion === quiz?.questionCount;
  }, [quiz]);

  const numberOfSteps = useSelector(
    (state) => state.instructions.project.steps.length,
  );

  const applySyntaxHighlighting = (container) => {
    const codeElements = container.querySelectorAll(
      ".language-python, .language-html, .language-css",
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
      stepContent.current.parentElement.scrollTo({ top: 0 });
      stepContent.current.innerHTML = content;
      applySyntaxHighlighting(stepContent.current);
    };
    if (isQuiz && !quizCompleted) {
      setStepContent(quiz.questions[quiz.currentQuestion]);
      document.dispatchEvent(quizReadyEvent);
    } else if (steps[currentStepPosition]) {
      setStepContent(steps[currentStepPosition].content);
    }
  }, [steps, currentStepPosition, quiz, quizCompleted, isQuiz]);

  useEffect(() => {
    if (quizCompleted && isQuiz) {
      dispatch(
        setCurrentStepPosition(
          Math.min(currentStepPosition + 1, numberOfSteps - 1),
        ),
      );
    }
  }, [quizCompleted, currentStepPosition, numberOfSteps, dispatch, isQuiz]);

  useEffect(() => {
    dispatch(setProjectInstructions(editInstructions));
  }, [editInstructions, dispatch]);

  useEffect(() => {
    if (project?.instructions) {
      setEditInstructions(project.instructions);
    }
  }, [project, dispatch]);

  return (
    <SidebarPanel
      defaultWidth="30vw"
      heading={t("instructionsPanel.projectSteps")}
      Footer={ProgressBar}
    >
      <div>
        {instructionsEditable && (
          <textarea
            value={editInstructions}
            onChange={(e) => setEditInstructions(e.target.value)}
          ></textarea>
        )}
      </div>
      <div className="project-instructions" ref={stepContent}></div>
    </SidebarPanel>
  );
};

export default InstructionsPanel;
