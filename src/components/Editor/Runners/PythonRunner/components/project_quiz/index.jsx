import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { loadQuiz } from "../../../../EditorSlice";
import Button from "../../../../../Button/Button";
import QuizQuestion from "./quiz_question";

import classNames from "classnames";
import PropTypes from "prop-types";

// import "../scratchblocks-v3.5.2-min";
import styles from "./styles.module.scss";

const ProjectQuiz = ({
  quizName,
  projectStyles,
  onQuizCompleted,
  inScratchOverlay,
}) => {
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  const quiz = useSelector((state) => state.quiz);

  const [questions, setQuestions] = useState([]);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [submittedAnswerId, setSubmittedAnswerId] = useState();
  const [selectedAnswerId, setSelectedAnswerId] = useState();
  const [quizQuestion, setQuizQuestion] = useState();

  const quizRef = useRef();
  const feedbackRef = useRef();

  const hasLoadedQuestions = questions.length > 0;
  const isLastQuestion = questionNumber === questions.length - 1;
  const isCorrectAnswer =
    quizQuestion && quizQuestion.isCorrectAnswer(submittedAnswerId);
  const questionHTML = hasLoadedQuestions && questions[questionNumber];

  useEffect(() => {
    if (quizName) {
      dispatch(
        loadQuiz({
          slug: "target-practice", // TODO: associate editor projects with project site slugs
          quizName,
          locale: i18n.language,
        })
      );
    }
  }, [quizName, i18n.language, dispatch]);

  useEffect(() => {
    if (quiz) {
      setQuestions(quiz.attributes.content.questions);
    }
  }, [quiz]);

  useEffect(() => {
    if (questionHTML) setQuizQuestion(new QuizQuestion(questionHTML));
  }, [questionHTML]);

  useEffect(() => {
    if (submittedAnswerId)
      feedbackRef.current.scrollIntoView({ behavior: "smooth" });
  }, [submittedAnswerId]);

  useEffect(() => {
    if (quizQuestion && questionNumber > 0)
      quizRef.current.scrollIntoView({ behavior: "smooth" });
  }, [questionNumber, quizQuestion]);

  useEffect(() => {
    if (isLastQuestion && isCorrectAnswer) onQuizCompleted();
  }, [isLastQuestion, isCorrectAnswer, onQuizCompleted]);

  // useEffect(() => {
  //   if (typeof scratchblocks !== "undefined") {
  //     scratchblocks.renderMatching(".language-blocks", { style: "scratch2" });
  //     scratchblocks.renderMatching(".language-blocks3", { style: "scratch3" });
  //   }
  // }, [quizQuestion]);

  if (!quizQuestion) {
    return <p>Loading...</p>;
  }

  return (
    <>
      {quizQuestion.hasIntro && (
        <div className={projectStyles.wrapped_top_level_elements}>
          <div
            className={styles.intro}
            dangerouslySetInnerHTML={{ __html: quizQuestion.introHTML }}
          />
        </div>
      )}

      <div
        ref={quizRef}
        className={classNames(
          projectStyles.wrapped_top_level_elements,
          styles.quiz
        )}
      >
        <form>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>{quizQuestion.legend}</legend>
            <div
              className={styles.blurb}
              dangerouslySetInnerHTML={{ __html: quizQuestion.blurbHTML }}
            />
            <div
              className={classNames(styles.answersContainer, {
                [styles.inScratchOverlay]: inScratchOverlay,
              })}
            >
              {Object.entries(quizQuestion.options).map(([id, labelHTML]) => (
                <label
                  key={`${questionNumber}-${id}`}
                  className={classNames(styles.answerLabel, {
                    [styles.selected]: selectedAnswerId === id,
                  })}
                >
                  <input
                    className={styles.answerRadio}
                    value={id}
                    name="answer"
                    type="radio"
                    onChange={(event) => {
                      setSelectedAnswerId(event.target.value);
                      setSubmittedAnswerId();
                    }}
                  />
                  <span className={styles.answerRadioControl} />
                  <p
                    className={styles.answerLabelContent}
                    dangerouslySetInnerHTML={{ __html: labelHTML }}
                  />
                </label>
              ))}
            </div>
          </fieldset>

          {submittedAnswerId && (
            <>
              <div
                ref={feedbackRef}
                className={classNames(
                  styles.feedback,
                  isCorrectAnswer ? styles.correct : styles.incorrect
                )}
              >
                <p className={styles.answerCorrectness}>
                  {isCorrectAnswer ? "Correct!" : "Try again"}
                </p>

                <p>{quizQuestion.feedback[submittedAnswerId]}</p>
              </div>

              {isCorrectAnswer && !isLastQuestion && (
                <Button.RectangleSecondary
                  onClick={(event) => {
                    event.preventDefault();
                    setQuestionNumber((n) => n + 1);
                    setSelectedAnswerId();
                    setSubmittedAnswerId();
                  }}
                  text="Next question"
                />
              )}
            </>
          )}

          {!submittedAnswerId && (
            <Button
              enabled={typeof selectedAnswerId !== "undefined"}
              onClick={(event) => {
                event.preventDefault();
                setSubmittedAnswerId(selectedAnswerId);
              }}
              text="Check my answer"
            />
          )}
        </form>
      </div>
    </>
  );
};

ProjectQuiz.propTypes = {
  repositoryName: PropTypes.string.isRequired,
  quizName: PropTypes.string.isRequired,
  projectStyles: PropTypes.object.isRequired,
  onQuizCompleted: PropTypes.func.isRequired,
  inScratchOverlay: PropTypes.bool,
};

export default ProjectQuiz;
