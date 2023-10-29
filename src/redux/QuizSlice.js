import { createSlice } from "@reduxjs/toolkit";
import { reducers } from "./reducers/quizReducers";

export const QuizSlice = createSlice({
  name: "quiz",
  initialState: {},
  reducers,
});

export const { setQuiz } = QuizSlice.actions;
export default QuizSlice.reducer;
