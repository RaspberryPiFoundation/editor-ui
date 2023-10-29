import { setQuiz } from "./quizReducers";

test("Sets quiz correctly", () => {
  let state = {};

  const quiz = {
    currentLocale: "en",
    error: null,
    fullPath: "",
    loading: true,
    passScore: 0,
    questions: [],
    slideDirection: "left",
  };

  expect(setQuiz(state, { payload: quiz })).toEqual(quiz);
});
