import React from "react";
import DownloadPanel from "components/Menus/Sidebar/DownloadPanel/DownloadPanel";

export default {
  title: "DownloadPanel",
  component: DownloadPanel,
};

const DefaultTemplate = () => {
  return <DownloadPanel />;
};

export const Default = DefaultTemplate.bind();
Default.args = {
  //   heading: "Download",
  //   confirmText: "Please confirm",
  //   onClickHandler: () => console.log("Button clicked"),
  //   buttonText: "Button text",
};
Default.parameters = { controls: {} };
