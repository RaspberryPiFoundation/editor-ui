import React, { useEffect, useMemo, useState } from "react";
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
import { collectSidebarPluginOptions } from "../../../plugins/sidebar";

const Sidebar = ({ options = [] }) => {
  const { t } = useTranslation();

  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });
  const projectImages = useSelector((state) => state.editor.project.image_list);
  const instructionsSteps = useSelector(
    (state) => state.instructions?.project?.steps,
  );
  const instructionsEditable = useSelector(
    (state) => state.editor.instructionsEditable,
  );

  const projectImagesLength = projectImages ? projectImages.length : 0;
  const instructionsStepCount = instructionsSteps
    ? instructionsSteps.length
    : 0;

  const baseMenuOptions = useMemo(
    () =>
      [
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
      ]
        .filter((optionConfig) => options.includes(optionConfig.name))
        .filter((optionConfig) => {
          if (optionConfig.name === "images") {
            return projectImagesLength > 0;
          }

          if (optionConfig.name === "instructions" && !instructionsEditable) {
            return instructionsStepCount > 0;
          }

          return true;
        }),
    [
      options,
      t,
      projectImagesLength,
      instructionsEditable,
      instructionsStepCount,
    ],
  );

  const pluginMenuOptions = useMemo(
    () =>
      collectSidebarPluginOptions({
        t,
        requestedOptions: options,
        isMobile,
        projectImages,
        projectImagesLength,
        instructionsEditable,
        instructionsSteps,
        instructionsStepCount,
      }),
    [
      t,
      options,
      isMobile,
      projectImages,
      projectImagesLength,
      instructionsEditable,
      instructionsSteps,
      instructionsStepCount,
    ],
  );

  const menuOptions = useMemo(() => {
    const combined = [...baseMenuOptions];

    pluginMenuOptions.forEach((pluginOption) => {
      if (!pluginOption) {
        return;
      }

      const alreadyExists = combined.some(
        (optionConfig) => optionConfig.name === pluginOption.name,
      );

      if (!alreadyExists) {
        combined.push(pluginOption);
      }
    });

    return combined;
  }, [baseMenuOptions, pluginMenuOptions]);

  const hasInstructions = instructionsStepCount > 0;

  const [option, setOption] = useState(
    instructionsEditable || hasInstructions ? "instructions" : "file",
  );

  useEffect(() => {
    if (instructionsEditable || hasInstructions) {
      setOption("instructions");
    }
  }, [instructionsEditable, hasInstructions]);

  useEffect(() => {
    if (!option) {
      return;
    }

    const optionExists = menuOptions.some(
      (menuOption) => menuOption.name === option,
    );

    if (!optionExists) {
      setOption(menuOptions[0] ? menuOptions[0].name : null);
    }
  }, [menuOptions, option]);

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
