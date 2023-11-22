import React from "react";
import { Provider } from "react-redux";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import EditorSlice from "redux/EditorSlice";

const createMockStore = function (components, openFiles) {
  return configureStore({
    reducer: {
      editor: createSlice({
        name: "editor",
        initialState: {
          project: {
            components,
          },
          isEmbedded: false,
          openFiles,
        },
        reducer: EditorSlice,
      }).reducer,
    },
  });
};

const store = createMockStore(
  [
    {
      name: "a",
      extension: "py",
    },
    {
      name: "b",
      extension: "html",
    },
    {
      name: "c",
      extension: "css",
    },
    {
      name: "d",
      extension: "csv",
    },
  ],
  [[]],
);

const MockStore = ({ children }) => (
  <Provider store={store}>{children}</Provider>
);

export default MockStore;
