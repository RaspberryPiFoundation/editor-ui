import React from "react";
import DownloadPanel from "../../../src/components/Menus/Sidebar/DownloadPanel/DownloadPanel";
import MockStore from "../../store/MockStore";

export default {
  title: "DownloadPanel",
  component: DownloadPanel,
};

const DefaultTemplate = () => {
  return (
    <MockStore>
      <DownloadPanel />
    </MockStore>
  );
};

export const Default = DefaultTemplate.bind();
Default.args = {};
Default.parameters = { controls: {} };
