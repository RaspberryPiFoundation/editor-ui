import { configureStore } from "@reduxjs/toolkit";
import EditorReducer from "../redux/EditorSlice";
import InstructionsReducer from "../redux/InstructionsSlice";
import WebComponentAuthReducer from "../redux/WebComponentAuthSlice";

const store = configureStore({
  reducer: {
    editor: EditorReducer,
    instructions: InstructionsReducer,
    auth: WebComponentAuthReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "redux-oidc/USER_FOUND",
          "redux-odic/SILENT_RENEW_ERROR",
        ],
        ignoredPaths: ["auth.user"],
      },
    }),
});

export default store;
