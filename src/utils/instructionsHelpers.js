export const stepIsKnowledgeQuiz = (step) => {
  const knowledgeQuiz = step.knowledgeQuiz;
  return typeof knowledgeQuiz === "string";
};
