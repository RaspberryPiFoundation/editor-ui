import { configureStore } from "@reduxjs/toolkit";
import { setUser } from "../WebComponentAuthSlice";
import rootReducer from "../RootSlice";
import userMiddleWare from "../middlewares/localStorageUserMiddleware";

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
    }).concat(userMiddleWare(setUser)),
});

export default store;
