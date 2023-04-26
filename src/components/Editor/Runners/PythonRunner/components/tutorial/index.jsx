import { forwardRef } from "react";
import classNames from "classnames";

import StepContentOrQuiz from "../step_content_or_quiz";
import Button from "../../../../../Button/Button";
import styles from "./styles.module.scss";
import stepContentStyles from "../step_content_styles.module.scss";

const Tutorial = forwardRef((props, ref) => {
  const {
    // steps,
    // projectSlug,
    // repositoryName,
    stepIndex,
    onStepChange,
    step,
    classOfStepContentToBeModified,
    // stepNavigationVisible,
    // onStepNavigationClick,
    // onStepNavigationLinkClick,
    // quizCompleted,
    onQuizCompleted,
    onStartAgainClick,
    // stepIndexToHref,
    isBlockBasedProject,
    showNextButton,
    showBackButton,
  } = props;

  return (
    step?.content && (
      <>
        <div ref={ref} />

        <div className={styles.project_page}>
          {/* <button
            className={styles.navigation_toggle}
            onClick={onStepNavigationClick}
          >
            Contents
          </button> */}

          <div className={stepContentStyles.step_content_container}>
            <div
              className={classNames(stepContentStyles.step_content, {
                [stepContentStyles.block_project]: isBlockBasedProject,
                [stepContentStyles.text_project]: !isBlockBasedProject,
              })}
            >
              <StepContentOrQuiz
                // projectSlug={projectSlug}
                // repositoryName={repositoryName}
                step={step}
                // quizCompleted={quizCompleted}
                onQuizCompleted={onQuizCompleted}
                projectStyles={stepContentStyles}
                onStartAgainClick={onStartAgainClick}
              >
                <div
                  className={classOfStepContentToBeModified}
                  dangerouslySetInnerHTML={{ __html: step.content }}
                />
              </StepContentOrQuiz>
            </div>
            <div className={styles.next_back_buttons}>
              {showBackButton && (
                <Button
                  buttonText="Back"
                  outline={true}
                  onClickHandler={() => onStepChange(stepIndex - 1)}
                  className={styles.back}
                />
              )}
              {showNextButton && (
                <Button
                  buttonText="Next"
                  onClickHandler={() => onStepChange(stepIndex + 1)}
                  className={styles.next}
                />
              )}
            </div>
          </div>
        </div>
      </>
    )
  );
});

export default Tutorial;
