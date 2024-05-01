import React from "react";
import { Provider } from "react-redux";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import EditorSlice from "redux/EditorSlice";

const MockStore = ({ children, initialState }) => {
  const store = configureStore({
    reducer: {
      editor: createSlice({
        name: "editor",
        initialState: initialState,
        reducer: EditorSlice,
      }).reducer,
    },
  });

  return <Provider store={store}>{children}</Provider>;
};

export default MockStore;
