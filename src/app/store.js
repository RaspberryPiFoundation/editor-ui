import { configureStore } from '@reduxjs/toolkit'
import EditorReducer from '../components/Editor/EditorSlice'
import { reducer } from 'redux-oidc'

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


export default store;
