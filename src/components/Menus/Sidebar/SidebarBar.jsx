import React, { useRef } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import classNames from "classnames";

import DoubleArrowLeft from "../../../assets/icons/double_arrow_left.svg";
import DoubleArrowRight from "../../../assets/icons/double_arrow_right.svg";
import Button from "../../Button/Button";
import SidebarBarOption from "./SidebarBarOption";
import webLogo from "../../../assets/web_icon.svg";
import pythonLogo from "../../../assets/python_icon.svg";
import blocksLogo from "../../../assets/blocks_icon.svg";
import { MOBILE_MEDIA_QUERY } from "../../../utils/mediaQueryBreakpoints";

const SidebarBar = (props) => {
  const {
    menuOptions,
    option,
    toggleOption,
    instructions = false,
    allowMobileView = true,
    children,
  } = props;
  const project = useSelector((state) => state.editor.project);
  const { t } = useTranslation();
  const topMenuOptions = menuOptions.filter(
    (menuOption) => menuOption.position === "top",
  );
  const bottomMenuOptions = menuOptions.filter(
    (menuOption) => menuOption.position === "bottom",
  );
  const menuOptionNames = menuOptions.map((menuOption) => menuOption.name);
  const viewportIsMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });
  const isMobile = allowMobileView && viewportIsMobile;
  const tabRefs = useRef({});
  const tabNames = [...topMenuOptions, ...bottomMenuOptions].map(
    (menuOption) => menuOption.name,
  );
  // With no open panel, the first tab is the tab stop
  const focusableTab = tabNames.includes(option) ? option : tabNames[0];

  const onTabKeyDown = (e, name) => {
    const index = tabNames.indexOf(name);
    const lastIndex = tabNames.length - 1;
    let nextIndex;

    switch (e.key) {
      case "ArrowDown":
        nextIndex = index === lastIndex ? 0 : index + 1;
        break;
      case "ArrowUp":
        nextIndex = index === 0 ? lastIndex : index - 1;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = lastIndex;
        break;
      default:
        return;
    }

    e.preventDefault();
    const nextName = tabNames[nextIndex];
    tabRefs.current[nextName]?.focus();

    // Open the focused tab's panel. toggleOption would close an open one.
    if (nextName !== option) toggleOption(nextName);
  };

  const renderTab = (menuOption, i) => (
    <SidebarBarOption
      key={i}
      Icon={menuOption.icon}
      title={menuOption.title}
      isActive={option === menuOption.name}
      isFocusable={focusableTab === menuOption.name}
      toggleOption={toggleOption}
      name={menuOption.name}
      onKeyDown={(e) => onTabKeyDown(e, menuOption.name)}
      buttonRef={(el) => {
        tabRefs.current[menuOption.name] = el;
      }}
    />
  );

  const findFirstExistingOption = (candidateOptions = []) => {
    return candidateOptions.find(
      (optionName) => optionName && menuOptionNames.includes(optionName),
    );
  };

  const expandPopOut = () => {
    const hasInstructions =
      Array.isArray(instructions) && instructions.length > 0;
    const expandOption = findFirstExistingOption([
      hasInstructions ? "instructions" : null,
      "file",
      topMenuOptions[0]?.name, // top part
      menuOptions[0]?.name, // bottom part
    ]);

    if (expandOption) {
      toggleOption(expandOption);
    }
    if (window.plausible) {
      // TODO: Make dynamic events for each option or rename this event
      window.plausible("Expand file pane");
    }
  };

  const collapsePopOut = () => {
    toggleOption(option);
    if (window.plausible) {
      window.plausible("Collapse file pane");
    }
  };

  const getProjectTypeLogo = (projectType) => {
    switch (projectType) {
      case "python":
        return pythonLogo;
      case "code_editor_scratch":
        return blocksLogo;
      case "html":
        return webLogo;
      default:
        return null;
    }
  };

  return (
    <>
      <div
        className={classNames("sidebar__bar", {
          "sidebar__bar--selected": option,
          "sidebar__bar--has-collapse": !isMobile,
        })}
        role="tablist"
        aria-orientation="vertical"
        aria-label={t("sidebar.tablistLabel")}
      >
        <div className={`sidebar__bar-options--top`}>
          <img
            className="editor-logo"
            src={getProjectTypeLogo(project.project_type)}
            alt={t("header.editorLogoAltText")}
          />
          {topMenuOptions.map(renderTab)}
        </div>
        <div className={`sidebar__bar-options--bottom`}>
          {bottomMenuOptions.map(renderTab)}
        </div>
      </div>
      {/* Tab moves from the selected tab into its panel before the collapse button.
          The collapse button is not a tab, so it is outside the tablist */}
      {children}
      {!isMobile && (
        <div
          className={classNames("sidebar__bar", "sidebar__bar-collapse", {
            "sidebar__bar--selected": option,
          })}
        >
          <div className={`sidebar__bar-options--bottom`}>
            {option ? (
              <div className="sidebar__bar-option-wrapper">
                <Button
                  className="sidebar__bar-option"
                  ButtonIcon={DoubleArrowLeft}
                  title={t("sidebar.collapse")}
                  onClickHandler={collapsePopOut}
                />
              </div>
            ) : (
              <div className="sidebar__bar-option-wrapper">
                <Button
                  className="sidebar__bar-option"
                  ButtonIcon={DoubleArrowRight}
                  title={t("sidebar.expand")}
                  onClickHandler={expandPopOut}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SidebarBar;
