import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { useDispatch, useSelector } from "react-redux";
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
import SidebarPanel from "./SidebarPanel";
import { setSidebarOption } from "../../../redux/EditorSlice";

const Sidebar = ({ options = [], plugins = [], allowMobileView = true }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const projectType = useSelector((state) => state.editor.project.project_type);
  const projectImages = useSelector((state) => state.editor.project.image_list);
  const instructionsSteps = useSelector(
    (state) => state.instructions?.project?.steps,
  );
  const instructionsEditable = useSelector(
    (state) => state.editor.instructionsEditable,
  );
  const selectedSidebarOption = useSelector(
    (state) => state.editor.selectedSidebarOption,
  );
  const viewportIsMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });
  const isMobile = allowMobileView && viewportIsMobile;

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
  ].filter((option) => {
    if (!options.includes(option.name)) return false;
    if (projectType === "code_editor_scratch" && option.name === "file")
      return false;
    return true;
  });

  let pluginMenuOptions = useMemo(
    () =>
      plugins.map((plugin) => {
        return {
          name: plugin.name,
          icon: plugin.icon,
          title: plugin.title,
          position: plugin.position || "top",
          panel: () => (
            <SidebarPanel
              heading={plugin.heading}
              buttons={plugin.buttons ? plugin.buttons() : []}
            >
              {plugin.panel()}
            </SidebarPanel>
          ),
        };
      }),
    [plugins],
  );

  menuOptions = [...menuOptions, ...pluginMenuOptions];

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

  const autoOpenPlugin = plugins?.find((plugin) => plugin.autoOpen);
  const hasInstructions = instructionsSteps && instructionsSteps.length > 0;
  let defaultOption = "file";
  if (autoOpenPlugin) {
    defaultOption = autoOpenPlugin.name;
  } else if (instructionsEditable || hasInstructions) {
    defaultOption = "instructions";
  }
  const defaultOptionIsAvailable = menuOptions.some(
    (menuOption) => menuOption.name === defaultOption,
  );
  const nextDefaultOption = defaultOptionIsAvailable ? defaultOption : null;
  const initialOption =
    selectedSidebarOption === undefined
      ? nextDefaultOption
      : selectedSidebarOption;
  const [option, setOption] = useState(initialOption);
  const optionIsAvailable =
    option === null ||
    menuOptions.some((menuOption) => menuOption.name === option);

  useEffect(() => {
    if (selectedSidebarOption === undefined) {
      setOption(nextDefaultOption);
    } else if (!optionIsAvailable) {
      setOption(nextDefaultOption);
      dispatch(setSidebarOption(nextDefaultOption));
    }
  }, [dispatch, nextDefaultOption, optionIsAvailable, selectedSidebarOption]);

  const updateOption = (nextOption) => {
    setOption(nextOption);
    dispatch(setSidebarOption(nextOption));
  };

  const toggleOption = (newOption) => {
    if (option !== newOption) {
      updateOption(newOption);
    } else if (!isMobile) {
      updateOption(null);
    }
  };

  const optionDict = menuOptions.find((menuOption) => {
    return menuOption.name === option;
  });
  const activeOption = optionDict ? option : null;

  const CustomSidebarPanel =
    optionDict && optionDict.panel ? optionDict.panel : () => {};

  return (
    <div
      className={classNames("sidebar", {
        "sidebar--mobile": isMobile,
        "sidebar--scratch": projectType === "code_editor_scratch",
      })}
    >
      <SidebarBar
        menuOptions={menuOptions}
        option={activeOption}
        toggleOption={toggleOption}
        instructions={instructionsSteps}
        allowMobileView={allowMobileView}
      />
      {activeOption && <CustomSidebarPanel isMobile={isMobile} />}
    </div>
  );
};

export default Sidebar;
