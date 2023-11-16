import React from "react";
import FilePanel from "components/Menus/Sidebar/FilePanel/FilePanel";
import MockStore from "../../store/MockStore";

export default {
  title: "FilePanel",
  component: FilePanel,
};

const DefaultTemplate = () => {
  return (
    <MockStore>
      <FilePanel />
    </MockStore>
  );
};

export const Default = DefaultTemplate.bind();
Default.args = {};
Default.parameters = { controls: {} };
