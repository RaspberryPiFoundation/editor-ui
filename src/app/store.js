import { configureStore } from "@reduxjs/toolkit";
import EditorReducer from "../redux/EditorSlice";
import InstructionsReducer from "../redux/InstructionsSlice";
import { reducer, loadUser } from "redux-oidc";
import UserManager from "../utils/userManager";

// TODO - not used but keeping this in preparation for using
// src/components/Editor/ImageUploadButton/ImageUploadButton.jsx
const userManager = UserManager({ reactAppAuthenticationUrl: "TODO" });
const store = configureStore({
  reducer: {
    editor: EditorReducer,
    instructions: InstructionsReducer,
    auth: reducer,
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

loadUser(store, userManager);

export default store;
