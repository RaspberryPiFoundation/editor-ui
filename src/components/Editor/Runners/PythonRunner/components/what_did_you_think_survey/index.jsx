import HappyFace from "assets/happy_face.svg";
import IndifferentFace from "assets/indifferent_face.svg";
import SadFace from "assets/sad_face.svg";
import Analytics from "analytics";
import styles from "./styles.module.scss";
import Link from "link";

const WhatDidYouThinkSurvey = ({ projectTitle }) => {
  const [surveyResponse, setSurveyResponse] = useState();

  const isActive = (response) => {
    return surveyResponse == response;
  };

  const responseHandler = (response) => {
    setSurveyResponse(response);

    Analytics.satisfactionSurveyResponse(projectTitle, response);
  };

  return (
    <div className="c-project-task">
      <div className={classNames("c-project-task__body", styles.survey)}>
        <h2>What did you think?</h2>

        <ul className={styles.responses}>
          <li
            className={
              classNames({
                [styles.active_response]: isActive("dislike"),
              }) || null
            }
          >
            <Link onClick={() => responseHandler("dislike")} tabindex={0}>
              <SadFace />
              <span>I didn&apos;t like it</span>
            </Link>
          </li>
          <li
            className={
              classNames({
                [styles.active_response]: isActive("ok"),
              }) || null
            }
          >
            <Link onClick={() => responseHandler("ok")} tabindex={0}>
              <IndifferentFace />
              <span>It was OK</span>
            </Link>
          </li>
          <li
            className={
              classNames({
                [styles.active_response]: isActive("like"),
              }) || null
            }
          >
            <Link onClick={() => responseHandler("like")} tabindex={0}>
              <HappyFace />
              <span>I loved it!</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

WhatDidYouThinkSurvey.propTypes = {
  projectTitle: PropTypes.string.isRequired,
};

export default WhatDidYouThinkSurvey;
