import { configureStore } from '@reduxjs/toolkit'
import EditorReducer from './Editor/EditorSlice'

export default configureStore({
  reducer: {
    editor: EditorReducer,
  },
})
