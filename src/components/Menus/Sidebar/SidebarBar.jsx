import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import classNames from "classnames";

import DoubleArrowLeft from "../../../assets/icons/double_arrow_left.svg";
import DoubleArrowRight from "../../../assets/icons/double_arrow_right.svg";
import Button from "../../Button/Button";
import SidebarBarOption from "./SidebarBarOption";
import htmlLogo from "../../../assets/html_icon.svg";
import pythonLogo from "../../../assets/python_icon.svg";
import { MOBILE_MEDIA_QUERY } from "../../../utils/mediaQueryBreakpoints";

const SidebarBar = (props) => {
  const { menuOptions, option, toggleOption, instructions = false } = props;
  const project = useSelector((state) => state.editor.project);
  const { t } = useTranslation();
  const topMenuOptions = menuOptions.filter(
    (menuOption) => menuOption.position === "top",
  );
  const bottomMenuOptions = menuOptions.filter(
    (menuOption) => menuOption.position === "bottom",
  );
  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });

  const expandPopOut = () => {
    const option = instructions.length > 0 ? "instructions" : "file";
    toggleOption(option);
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

  return (
    <div
      className={classNames("sidebar__bar", {
        "sidebar__bar--selected": option,
      })}
    >
      <div className={`sidebar__bar-options--top`}>
        <img
          className="editor-logo"
          src={project.project_type === "python" ? pythonLogo : htmlLogo}
          alt={t("header.editorLogoAltText")}
        />
        {topMenuOptions.map((menuOption, i) => (
          <SidebarBarOption
            key={i}
            Icon={menuOption.icon}
            title={menuOption.title}
            isActive={option === menuOption.name}
            toggleOption={toggleOption}
            name={menuOption.name}
            plugin={menuOption.plugin}
          />
        ))}
      </div>
      <div className={`sidebar__bar-options--bottom`}>
        {bottomMenuOptions.map((menuOption, i) => (
          <SidebarBarOption
            key={i}
            Icon={menuOption.icon}
            title={menuOption.title}
            isActive={option === menuOption.name}
            toggleOption={toggleOption}
            name={menuOption.name}
            plugin={menuOption.plugin}
          />
        ))}
        {!isMobile &&
          (option ? (
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
          ))}
      </div>
    </div>
  );
};

export default SidebarBar;
