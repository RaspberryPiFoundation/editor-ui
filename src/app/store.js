import { configureStore } from '@reduxjs/toolkit'
import EditorReducer from '../components/Editor/EditorSlice'
import { reducer, loadUser } from 'redux-oidc'
import userManager from '../utils/userManager'

const store = configureStore({
  reducer: {
    editor: EditorReducer,
    auth: reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['redux-oidc/USER_FOUND'],
        ignoredPaths: ['auth.user'],
    },
  }),
})

loadUser(store, userManager);

export default store;
