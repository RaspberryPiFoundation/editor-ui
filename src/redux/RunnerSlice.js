import { createSlice } from "@reduxjs/toolkit";
import { reducers } from "./reducers/runnerReducers";

export const RunnerSlice = createSlice({
  name: "runner",
  initialState: {
    pythonInterpreter: "pyodide",
  },
  reducers,
});

export const { switchToSkulpt } = RunnerSlice.actions;
export default RunnerSlice.reducer;
