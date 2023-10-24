import { stepIsKnowledgeQuiz } from "./instructionsHelpers";

test("stepIsKnowledgeQuiz returns true if a step's knowledeQuiz is a string", () => {
  const step = { knowledgeQuiz: "testQuiz" };
  expect(stepIsKnowledgeQuiz(step)).toEqual(true);
});

test("stepIsKnowledgeQuiz returns false if a has no value for knowledeQuiz", () => {
  const step = {};
  expect(stepIsKnowledgeQuiz(step)).toEqual(false);
});
