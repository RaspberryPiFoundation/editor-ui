import React, { useEffect, useState } from "react";

import ProjectAPIClient from "../helpers/project_api_client";

const useProjectContent = ({ repositoryName, excludeQuiz }) => {
  const [content, setContent] = useState();
  const [steps, setSteps] = useState([]);
  const client = new ProjectAPIClient("http://localhost:3005");

  useEffect(() => {
    client.getProject(repositoryName).then(({ data: responseData }) => {
      const responseContent = responseData.data.attributes.content;

      const excludedStepTitles = ["What next?"];
      const excludedQuizes = excludeQuiz ? ["quiz1"] : [];

      const stepsToDisplay = responseContent.steps
        .filter(({ title }) => !excludedStepTitles.includes(title))
        .filter(({ knowledgeQuiz }) => !excludedQuizes.includes(knowledgeQuiz))
        .sort((a, b) => a.position - b.position);

      const surveyStep = {
        quiz: false,
        title: "What did you think?",
        challenge: false,
        content: `<div class="survey-container" data-project-title="${responseContent.title}"></div>`,
      };
      stepsToDisplay.push(surveyStep);
      stepsToDisplay.forEach((step, index) => {
        step.position = index;
      });

      setSteps(stepsToDisplay);
      setContent(responseContent);
    });
  }, [repositoryName]); // eslint-disable-line react-hooks/exhaustive-deps

  return [content, steps];
};

export default useProjectContent;
