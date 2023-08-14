import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import FilePanel from "./FilePanel/FilePanel";
import InfoPanel from "./InfoPanel/InfoPanel";
import SidebarBar from "./SidebarBar";
import MobileSidebarBar from "../../Mobile/MobileSidebarBar/MobileSidebarBar";
import SettingsPanel from "./SettingsPanel/SettingsPanel";
import {
  HomeIcon,
  FileIcon,
  ImageIcon,
  InfoIcon,
  SettingsIcon,
} from "../../../Icons";
import ProjectsPanel from "./ProjectsPanel/ProjectsPanel";

import "./Sidebar.scss";
import ImagePanel from "./ImagePanel/ImagePanel";
import { useSelector } from "react-redux";
import { MOBILE_MEDIA_QUERY } from "../../../utils/mediaQueryBreakpoints";
import { useMediaQuery } from "react-responsive";

const Sidebar = () => {
  const { t } = useTranslation();
  let menuOptions = [
    {
      name: "projects",
      icon: HomeIcon,
      title: t("sidebar.projects"),
      position: "top",
      panel: ProjectsPanel,
    },
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
    {
      name: "settings",
      icon: SettingsIcon,
      title: t("sidebar.settings"),
      position: "bottom",
      panel: SettingsPanel,
    },
    {
      name: "info",
      icon: InfoIcon,
      title: t("sidebar.information"),
      position: "bottom",
      panel: InfoPanel,
    },
  ];
  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });
  const projectImages = useSelector((state) => state.editor.project.image_list);
  if (!projectImages || projectImages.length === 0) {
    menuOptions.splice(
      menuOptions.findIndex((option) => option.name === "images"),
      1,
    );
  }
  const [option, setOption] = useState(isMobile ? "file" : null);
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
      {isMobile ? (
        <MobileSidebarBar
          menuOptions={menuOptions}
          option={option}
          toggleOption={toggleOption}
        />
      ) : (
        <SidebarBar
          menuOptions={menuOptions}
          option={option}
          toggleOption={toggleOption}
        />
      )}
      {option ? <CustomSidebarPanel /> : null}
    </div>
  );
};

export default Sidebar;
