import React from "react";
import DownloadPanel from "components/Menus/Sidebar/DownloadPanel/DownloadPanel";
import { Provider } from "react-redux";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import EditorSlice from "redux/EditorSlice";

export default {
  title: "DownloadPanel",
  component: DownloadPanel,
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

const Mockstore = ({ children }) => (
  <Provider store={store}>{children}</Provider>
);

const DefaultTemplate = () => {
  return (
    <Mockstore>
      <DownloadPanel />
    </Mockstore>
  );
};

export const Default = DefaultTemplate.bind();
Default.args = {};
Default.parameters = { controls: {} };
