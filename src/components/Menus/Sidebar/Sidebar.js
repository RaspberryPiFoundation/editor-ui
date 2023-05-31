import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { DoubleChevronLeft, FileIcon } from "../../../Icons";
import Button from "../../Button/Button";
import FilePane from "./FilePane/FilePane";
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
      panel: () => FilePane({ openFileTab: openFileTab }),
    },
  ];
  const [option, setOption] = useState("file");
  const toggleOption = (newOption) => {
    option !== newOption ? setOption(newOption) : setOption(null);
  };

  const optionDict = menuOptions.find((menuOption) => {
    return menuOption.name === option;
  });
  const SidebarPanel =
    optionDict && optionDict.panel ? optionDict.panel : () => {};

  const collapsePopOut = () => {
    toggleOption(option);
    window.plausible("Collapse file pane");
  };

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
          <Button
            className="btn--secondary btn--small"
            ButtonIcon={DoubleChevronLeft}
            buttonOuter
            buttonOuterClassName="sidebar-collapse-button"
            title={t("sidebar.collapse")}
            onClickHandler={collapsePopOut}
          />
        </ResizableWithHandle>
      ) : null}
    </div>
  );
};

export default Sidebar;
