export const stepIsKnowledgeQuiz = (step) => {
  if (step) {
    const knowledgeQuiz = step.knowledgeQuiz;
    return typeof knowledgeQuiz === "string";
  }
  return false;
};
