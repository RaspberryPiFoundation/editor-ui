import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";

import FilePanel from "./FilePanel/FilePanel";
import InfoPanel from "./InfoPanel/InfoPanel";
import SidebarBar from "./SidebarBar";
import SettingsPanel from "./SettingsPanel/SettingsPanel";
import HomeIcon from "../../../assets/icons/home.svg";
import ImageIcon from "../../../assets/icons/image.svg";
import InfoIcon from "../../../assets/icons/info.svg";
import SettingsIcon from "../../../assets/icons/settings.svg";
import StepsIcon from "../../../assets/icons/steps.svg";
import SaveIcon from "../../../assets/icons/save.svg";

import ProjectsPanel from "./ProjectsPanel/ProjectsPanel";

import "../../../assets/stylesheets/Sidebar.scss";
import ImagePanel from "./ImagePanel/ImagePanel";
import { MOBILE_MEDIA_QUERY } from "../../../utils/mediaQueryBreakpoints";
import FileIcon from "../../../utils/FileIcon";
import DownloadPanel from "./DownloadPanel/DownloadPanel";
import InstructionsPanel from "./InstructionsPanel/InstructionsPanel";

const Sidebar = ({ options = [] }) => {
  const { t } = useTranslation();
  const instructionsEditable = useSelector(
    (state) => state.editor.instructionsEditable,
  );

  let menuOptions = [
    {
      name: "projects",
      icon: HomeIcon,
      title: t("sidebar.projects"),
      position: "top",
      panel: ProjectsPanel,
    },
    {
      name: "instructions",
      icon: StepsIcon,
      title: t("sidebar.instructions"),
      position: "top",
      panel: InstructionsPanel,
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
      name: "download",
      icon: SaveIcon,
      title: t("sidebar.download"),
      position: "top",
      panel: DownloadPanel,
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
  ].filter((option) => options.includes(option.name));

  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });
  const projectImages = useSelector((state) => state.editor.project.image_list);
  const instructionsSteps = useSelector(
    (state) => state.instructions?.project?.steps,
  );

  const removeOption = (optionName, depArray = []) => {
    if ((!depArray || depArray.length === 0) && options.includes(optionName)) {
      menuOptions.splice(
        menuOptions.findIndex((option) => option.name === optionName),
        1,
      );
    }
  };

  // Remove panels if dependency arrays are empty
  removeOption("images", projectImages);
  if (!instructionsEditable) {
    removeOption("instructions", instructionsSteps);
  }

  const [option, setOption] = useState(
    instructionsSteps ? "instructions" : "file",
  );

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
        instructions={instructionsSteps}
      />
      {option && <CustomSidebarPanel isMobile={isMobile} />}
    </div>
  );
};

export default Sidebar;
