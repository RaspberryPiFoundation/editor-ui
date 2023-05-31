import React from "react";
import Button from "../../Button/Button";

const SidebarBarOption = (props) => {
  const { Icon, isActive, name, title, toggleOption } = props;

  const onClickHandler = () => {
    toggleOption(name);
    if (name === "file") {
      window.plausible("Side menu open project files");
    }
  };

  return (
    <Button
      className={`sidebar__bar-option${
        isActive ? " sidebar__bar-option--active" : ""
      }`}
      ButtonIcon={Icon}
      title={title}
      onClickHandler={onClickHandler}
    />
  );
};

export default SidebarBarOption;
