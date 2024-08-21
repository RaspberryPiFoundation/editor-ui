import { configureStore } from "@reduxjs/toolkit";
import EditorReducer from "../EditorSlice";
import InstructionsReducer from "../InstructionsSlice";
import WebComponentAuthReducer, { setUser } from "../WebComponentAuthSlice";
import userMiddleWare from "../middlewares/localStorageUserMiddleware";

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
    }).concat(userMiddleWare(setUser)),
});

export default store;
