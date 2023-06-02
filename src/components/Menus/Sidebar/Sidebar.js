import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { FileIcon } from "../../../Icons";
import FilePanel from "./FilePanel/FilePanel";
import SidebarBar from "./SidebarBar";

import "./Sidebar.scss";

const Sidebar = () => {
  const { t } = useTranslation();
  const menuOptions = [
    {
      name: "file",
      icon: FileIcon,
      title: t("sidebar.file"),
      position: "top",
      panel: FilePanel,
    },
  ];
  const [option, setOption] = useState();
  const toggleOption = (newOption) => {
    option !== newOption ? setOption(newOption) : setOption(null);
  };

  const optionDict = menuOptions.find((menuOption) => {
    return menuOption.name === option;
  });
  const CustomSidebarPanel =
    optionDict && optionDict.panel ? optionDict.panel : () => {};

  return (
    <div className="sidebar">
      <SidebarBar
        menuOptions={menuOptions}
        option={option}
        toggleOption={toggleOption}
      />
      {option ? <CustomSidebarPanel /> : null}
    </div>
  );
};

export default Sidebar;
