import { configureStore } from '@reduxjs/toolkit'
import EditorReducer from '../components/Editor/EditorSlice'

const ComponentStore = configureStore({
  reducer: {
    editor: EditorReducer,
  },
})

export default ComponentStore;
