import React from "react";
import Button from "../../Button/Button";

const MenuSideBarOption = (props) => {
  const { Icon, isActive, name, title, toggleOption } = props;

  const onClickHandler = () => {
    toggleOption(name);
    if (name === "file") {
      window.plausible("Side menu open project files");
    }
  };

  return (
    <Button
      className={`menu-sidebar-option${
        isActive ? " menu-sidebar-option--active" : ""
      }`}
      ButtonIcon={Icon}
      title={title}
      onClickHandler={onClickHandler}
    />
  );
};

export default MenuSideBarOption;
