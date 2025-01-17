import { createSlice } from "@reduxjs/toolkit";
import editorReducer, { editorInitialState } from "./EditorSlice.js";
import instructionsReducer, {
  instructionsInitialState,
} from "./InstructionsSlice.js";
import authReducer, { authInitialState } from "./WebComponentAuthSlice.js";

const initialState = {
  editor: editorInitialState,
  instructions: instructionsInitialState,
  auth: authInitialState,
};

const RootSlice = createSlice({
  name: "root",
  initialState,
  reducers: {
    resetStore: (state) => {
      state.editor = editorInitialState;
      state.instructions = instructionsInitialState;
    },
  },
  extraReducers: (builder) => {
    builder.addDefaultCase((state, action) => {
      state.editor = editorReducer(state.editor, action);
      state.instructions = instructionsReducer(state.instructions, action);
      state.auth = authReducer(state.auth, action);
    });
  },
});

export const { resetStore } = RootSlice.actions;
export default RootSlice.reducer;
