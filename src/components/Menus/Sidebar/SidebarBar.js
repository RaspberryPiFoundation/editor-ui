import React from "react";
import { useTranslation } from "react-i18next";
import { DoubleChevronRight } from "../../../Icons";
import Button from "../../Button/Button";
import SidebarBarOption from "./SidebarBarOption";

const SidebarBar = (props) => {
  const { menuOptions, option, toggleOption } = props;
  const { t } = useTranslation();
  const topMenuOptions = menuOptions.filter(
    (menuOption) => menuOption.position === "top",
  );
  const bottomMenuOptions = menuOptions.filter(
    (menuOption) => menuOption.position === "bottom",
  );

  const expandPopOut = () => {
    toggleOption("file");
    window.plausible("Expand file pane");
  };

  return (
    <div className="sidebar__bar">
      <div className={`sidebar__bar-options--top`}>
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
        {option ? null : (
          <Button
            className="btn--secondary btn--small"
            ButtonIcon={DoubleChevronRight}
            title={t("sidebar.expand")}
            buttonOuter
            buttonOuterClassName="sidebar-expand-button"
            onClickHandler={expandPopOut}
          />
        )}
      </div>
    </div>
  );
};

export default SidebarBar;
