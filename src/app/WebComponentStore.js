import { configureStore } from "@reduxjs/toolkit";
import EditorReducer from "../redux/EditorSlice";
import InstructionsReducer from "../redux/InstructionsSlice";
import WebComponentAuthReducer from "../redux/WebComponentAuthSlice";
import { setUser } from "../redux/WebComponentAuthSlice";

const customMiddleWare = (store) => (next) => (action) => {
  if (action.type.startsWith("editor")) {
    console.log("Middleware triggered:", action);
    const authKey = localStorage.getItem("authKey");
    if (authKey) {
      const localStorageUser = JSON.parse(localStorage.getItem(authKey));
      if (
        JSON.stringify(store.getState().auth.user) !==
        JSON.stringify(localStorageUser)
      ) {
        console.log("Updating user");
        console.log("Old user:");
        console.log(store.getState().auth.user);
        console.log("New user:");
        console.log(localStorageUser);
        store.dispatch(setUser(localStorageUser));
      }
    }
  }
  next(action);
};

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
    }).concat(customMiddleWare),
});

export default store;
