import React from "react";
import classNames from "classnames";

const SidebarBarOption = (props) => {
  const { Icon, isActive, name, title, toggleOption } = props;

  const onClickHandler = () => {
    toggleOption(name);
    if (name === "file" && window.plausible) {
      window.plausible("Side menu open project files");
    }
  };

  return (
    <div
      className={classNames("sidebar__bar-option-wrapper", {
        "sidebar__bar-option-wrapper--selected": isActive,
      })}
    >
      <button
        className={classNames("sidebar__bar-option", {
          "sidebar__bar-option--selected": isActive,
        })}
        title={title}
        onClick={onClickHandler}
      >
        <Icon />
      </button>
    </div>
  );
};

export default SidebarBarOption;
