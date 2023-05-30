import React from "react";
import { useTranslation } from "react-i18next";
import { DoubleChevronRight } from "../../../Icons";
import Button from "../../Button/Button";
import MenuSideBarOption from "./MenuSideBarOption";

const MenuSideBar = (props) => {
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
    <div className="menu-sidebar">
      <div className={`menu-options-top`}>
        {topMenuOptions.map((menuOption, i) => (
          <MenuSideBarOption
            key={i}
            Icon={menuOption.icon}
            title={menuOption.title}
            isActive={option === menuOption.name}
            toggleOption={toggleOption}
            name={menuOption.name}
          />
        ))}
      </div>
      <div className={`menu-options-bottom`}>
        {bottomMenuOptions.map((menuOption, i) => (
          <MenuSideBarOption
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
            title={t("sideMenu.expand")}
            buttonOuter
            buttonOuterClassName="menu-expand-button"
            onClickHandler={expandPopOut}
          />
        )}
      </div>
    </div>
  );
};

export default MenuSideBar;
