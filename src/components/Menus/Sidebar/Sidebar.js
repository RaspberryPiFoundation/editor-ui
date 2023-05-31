import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { FileIcon } from "../../../Icons";
import FilePanel from "./FilePanel/FilePanel";
import SidebarBar from "./SidebarBar";
import ResizableWithHandle from "../../../utils/ResizableWithHandle";

import "./Sidebar.scss";

const Sidebar = (props) => {
  const { openFileTab } = props;
  const { t } = useTranslation();
  const menuOptions = [
    {
      name: "file",
      icon: FileIcon,
      title: t("sidebar.file"),
      position: "top",
      panel: () => FilePanel({ openFileTab: openFileTab }),
    },
  ];
  const [option, setOption] = useState();
  const toggleOption = (newOption) => {
    option !== newOption ? setOption(newOption) : setOption(null);
  };

  const optionDict = menuOptions.find((menuOption) => {
    return menuOption.name === option;
  });
  const SidebarPanel =
    optionDict && optionDict.panel ? optionDict.panel : () => {};

  return (
    <div className="sidebar">
      <SidebarBar
        menuOptions={menuOptions}
        option={option}
        toggleOption={toggleOption}
      />
      {option ? (
        <ResizableWithHandle
          data-testid="sidebar__panel"
          className="sidebar__panel"
          defaultWidth="200px"
          handleDirection="right"
          minWidth="150px"
          maxWidth="300px"
        >
          <SidebarPanel />
        </ResizableWithHandle>
      ) : null}
    </div>
  );
};

export default Sidebar;
