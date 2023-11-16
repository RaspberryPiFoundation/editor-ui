import React from "react";
import FilePanel from "components/Menus/Sidebar/FilePanel/FilePanel";
import EditorSlice from "redux/EditorSlice";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

export default {
  title: "FilePanel",
  component: FilePanel,
};

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

const DefaultTemplate = () => {
  return (
    <Mockstore>
      <FilePanel />
    </Mockstore>
  );
};

const Mockstore = ({ children }) => (
  <Provider store={store}>{children}</Provider>
);

export const Default = DefaultTemplate.bind();
Default.args = {};
Default.parameters = { controls: {} };
