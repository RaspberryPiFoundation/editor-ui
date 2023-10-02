import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";

import FilePanel from "./FilePanel/FilePanel";
import InfoPanel from "./InfoPanel/InfoPanel";
import SidebarBar from "./SidebarBar";
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
import { MOBILE_MEDIA_QUERY } from "../../../utils/mediaQueryBreakpoints";

const Sidebar = ({ forWebComponent = false }) => {
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
    if (option !== newOption) {
      setOption(newOption);
    } else if (!isMobile) {
      setOption(null);
    }
  };

  const optionDict = menuOptions.find((menuOption) => {
    return menuOption.name === option;
  });
  const CustomSidebarPanel =
    optionDict && optionDict.panel ? optionDict.panel : () => {};

  return (
    <div className={classNames("sidebar", { "sidebar--mobile": isMobile })}>
      <SidebarBar
        menuOptions={menuOptions}
        option={option}
        toggleOption={toggleOption}
        forWebComponent={forWebComponent}
      />
      {option && <CustomSidebarPanel isMobile={isMobile} />}
    </div>
  );
};

export default Sidebar;
