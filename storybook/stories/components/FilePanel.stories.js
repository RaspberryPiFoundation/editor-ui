import React from "react";
import FilePanel from "components/Menus/Sidebar/FilePanel/FilePanel";
import MockStore from "../../store/MockStore";

export default {
  title: "FilePanel",
  component: FilePanel,
};

const DefaultTemplate = () => {
  return (
    <MockStore
      initialState={{
        project: {
          components: [
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
        },
        isEmbedded: false,
        // openFiles: [[]],
        // picoConnected: true,
      }}
    >
      <FilePanel />
    </MockStore>
  );
};

export const Default = DefaultTemplate.bind();
Default.args = {};
Default.parameters = { controls: {} };
