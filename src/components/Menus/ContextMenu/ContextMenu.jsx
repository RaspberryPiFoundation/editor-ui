import React, { useContext, useRef, useState } from "react";
import { ControlledMenu, MenuItem } from "@szhsin/react-menu";
import { SettingsContext } from "../../../settings";

import "../../../assets/stylesheets/ContextMenu.scss";

const ContextMenu = (props) => {
  const {
    align,
    direction,
    menuButtonLabel,
    menuButtonClassName,
    MenuButtonIcon,
    menuOptions,
    offsetX,
    offsetY,
  } = props;
  const settings = useContext(SettingsContext);
  const menuButton = useRef(null);
  const contextMenu = useRef();
  const [isOpen, setOpen] = useState(false);
  const setMenuOpenState = (isMenuOpen) => {
    setOpen(isMenuOpen);
    if (isMenuOpen) {
      const hiddenDiv = contextMenu.current.firstChild;
      hiddenDiv.setAttribute("role", "menuitem");
      hiddenDiv.setAttribute("aria-hidden", "true");
    } else {
      menuButton.current.focus();
    }
  };

  return (
    <>
      <button
        aria-haspopup="menu"
        aria-label={menuButtonLabel}
        className={`btn btn--tertiary context-menu__drop${
          menuButtonClassName ? ` ${menuButtonClassName}` : ""
        }`}
        title={menuButtonLabel}
        type="button"
        ref={menuButton}
        onClick={() => setMenuOpenState(true)}
      >
        <MenuButtonIcon />
      </button>
      <ControlledMenu
        transition
        align={align}
        direction={direction}
        menuStyle={{ padding: "5px" }}
        offsetX={offsetX}
        offsetY={offsetY}
        position="anchor"
        viewScroll="initial"
        portal={true}
        menuClassName={`context-menu context-menu--${settings.theme}`}
        menuItemFocus={{ position: "first" }}
        state={isOpen ? "open" : "closed"}
        anchorRef={menuButton}
        ref={contextMenu}
        onClose={() => setMenuOpenState(false)}
      >
        {menuOptions.map((option, i) => (
          <MenuItem
            key={i}
            className="btn context-menu__item"
            onClick={option.action}
          >
            <option.icon />
            &nbsp;{option.text}
          </MenuItem>
        ))}
      </ControlledMenu>
    </>
  );
};

export default ContextMenu;
