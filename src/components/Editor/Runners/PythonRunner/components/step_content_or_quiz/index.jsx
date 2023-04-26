import PropTypes from "prop-types";

import Project from "../../../../../../helpers/project";
// import ProjectBadgeForChecklist from "../project_badge_for_checklist";
// import ProjectBadgeForQuiz from "../project_badge_for_quiz";
import ProjectQuiz from "../project_quiz";
// import BadgeState from "../project_badge_for_checklist/badge_state";
// import useBadgeState from "../../hooks/use_badge_state";

const StepContentOrQuiz = ({
  // projectSlug,
  // repositoryName,
  step,
  // quizCompleted,
  onQuizCompleted,
  projectStyles,
  children,
  // onStartAgainClick,
  inScratchOverlay,
}) => {
  // const pathwayKey = Project.pathwayKey(projectSlug);
  // const [badgeTemplate, badgeState, setBadgeState] = useBadgeState(
  //   projectSlug,
  //   pathwayKey
  // );
  const quizName = step && step.knowledgeQuiz;

  // useEffect(() => {
  //   if (quizCompleted && badgeState === BadgeState.NOT_AWARDED) {
  //     setBadgeState(BadgeState.AWARD_REQUESTED);
  //   }
  // }, [quizCompleted, badgeState, setBadgeState]);

  // const handleGetBadge = () => {
  //   setBadgeState(BadgeState.AWARD_REQUESTED);
  // };

  if (Project.isQuiz(step)) {
    // if (quizCompleted) {
    //   return (
    //     <ProjectBadgeForQuiz
    //       badgeTemplate={badgeTemplate}
    //       badgeState={badgeState}
    //       onStartAgainClick={onStartAgainClick}
    //       className={projectStyles.wrapped_top_level_elements}
    //       inScratchOverlay={inScratchOverlay}
    //     />
    //   );
    // } else {
    return (
      <ProjectQuiz
        quizName={quizName}
        projectStyles={projectStyles}
        onQuizCompleted={onQuizCompleted}
        inScratchOverlay={inScratchOverlay}
      />
    );
    // }
  } else {
    return (
      <>
        {children}

        {/* {!Project.isQuiz(step) && Project.canBadgeBeAwardedOn(step) && (
          <ProjectBadgeForChecklist
            badgeTemplate={badgeTemplate}
            badgeState={badgeState}
            onGetBadge={handleGetBadge}
            className={projectStyles.wrapped_top_level_elements}
          />
        )} */}
      </>
    );
  }
};

StepContentOrQuiz.propTypes = {
  // projectSlug: PropTypes.string.isRequired,
  // repositoryName: PropTypes.string.isRequired,
  step: PropTypes.object.isRequired,
  // quizCompleted: PropTypes.bool.isRequired,
  onQuizCompleted: PropTypes.func.isRequired,
  projectStyles: PropTypes.object.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  // onStartAgainClick: PropTypes.func.isRequired,
  inScratchOverlay: PropTypes.bool,
};
export default StepContentOrQuiz;
