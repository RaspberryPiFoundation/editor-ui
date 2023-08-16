import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import SidebarBarOption from "../../Menus/Sidebar/SidebarBarOption";
import htmlLogo from "../../../assets/html_icon.svg";
import pythonLogo from "../../../assets/python_icon.svg";
import Button from "../../Button/Button";
import { CloseIcon } from "../../../Icons";

const MobileSidebarBar = (props) => {
  const { menuOptions, option, toggleOption } = props;
  const project = useSelector((state) => state.editor.project);
  const { t } = useTranslation();
  const topMenuOptions = menuOptions.filter(
    (menuOption) => menuOption.position === "top",
  );
  const bottomMenuOptions = menuOptions.filter(
    (menuOption) => menuOption.position === "bottom",
  );
  const [selectedTab, setSelectedTab] = useState(0);

  const collapseSidebar = () => {
    toggleOption(selectedTab);
    window.plausible("Collapse file pane");
  };

  return (
    <div className={`sidebar__bar${option ? " sidebar__bar--selected" : ""}`}>
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
          />
        ))}
        <Button
          className="btn--tertiary"
          ButtonIcon={CloseIcon}
          title={t("sidebar.expand")}
          buttonOuter
          buttonOuterClassName="sidebar-expand-button"
          onClickHandler={collapseSidebar}
        />
      </div>
    </div>
  );
};

export default MobileSidebarBar;
