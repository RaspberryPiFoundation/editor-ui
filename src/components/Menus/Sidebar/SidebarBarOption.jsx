import React from "react";
import Button from "../../Button/Button";
import classNames from "classnames";
import { getSidebarPanelId, getSidebarTabId } from "./sidebarTabIds";

const SidebarBarOption = (props) => {
  const {
    Icon,
    isActive,
    isFocusable = isActive,
    name,
    title,
    toggleOption,
    onKeyDown,
    buttonRef,
  } = props;

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
      <Button
        className={classNames("sidebar__bar-option", {
          "sidebar__bar-option--selected": isActive,
        })}
        ButtonIcon={Icon}
        title={title}
        role="tab"
        id={getSidebarTabId(name)}
        tabIndex={isFocusable ? 0 : -1}
        ariaSelected={!!isActive}
        ariaControls={isActive ? getSidebarPanelId(name) : undefined}
        buttonRef={buttonRef}
        onKeyDown={onKeyDown}
        onClickHandler={onClickHandler}
      />
    </div>
  );
};

export default SidebarBarOption;
