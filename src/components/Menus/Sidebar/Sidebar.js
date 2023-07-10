import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { FileIcon, ImageIcon } from "../../../Icons";
import FilePanel from "./FilePanel/FilePanel";
import SidebarBar from "./SidebarBar";

import "./Sidebar.scss";
import ImagePanel from "./ImagePanel/ImagePanel";
import { useSelector } from "react-redux";

const Sidebar = () => {
  const { t } = useTranslation();
  let menuOptions = [
    {
      name: "file",
      icon: FileIcon,
      title: t("sidebar.file"),
      position: "top",
      panel: FilePanel,
    },
    {
      name: "images",
      icon: ImageIcon,
      title: t("sidebar.images"),
      position: "top",
      panel: ImagePanel,
    },
  ];
  const projectImages = useSelector((state) => state.editor.project.image_list);
  if (!projectImages || projectImages.length === 0) {
    menuOptions.splice(
      menuOptions.findIndex((option) => option.name === "images"),
    );
  }
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
