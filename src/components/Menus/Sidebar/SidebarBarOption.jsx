import React from "react";
import Button from "../../Button/Button";
import classNames from "classnames";

const SidebarBarOption = (props) => {
  const { Icon, isActive, name, title, toggleOption, plugin } = props;
  const pluginId = plugin?.id;

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
        "sidebar__bar-option-wrapper--plugin": pluginId,
      })}
      data-plugin-id={pluginId}
    >
      <Button
        className={classNames("sidebar__bar-option", {
          "sidebar__bar-option--selected": isActive,
          "sidebar__bar-option--plugin": pluginId,
        })}
        ButtonIcon={Icon}
        title={title}
        onClickHandler={onClickHandler}
      />
    </div>
  );
};

export default SidebarBarOption;
