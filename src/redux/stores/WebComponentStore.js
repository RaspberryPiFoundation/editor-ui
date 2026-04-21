import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "../RootSlice";

const store = configureStore({
  reducer: rootReducer,
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
