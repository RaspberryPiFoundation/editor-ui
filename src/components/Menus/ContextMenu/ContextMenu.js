import React, { useContext, useRef, useState } from "react";
import { ControlledMenu, MenuButton, MenuItem } from "@szhsin/react-menu";
import { SettingsContext } from "../../../settings";

import './ContextMenu.scss'

const ContextMenu = (props) => {

  const { align, direction, menuButtonLabel, menuButtonClassName, MenuButtonIcon, menuOptions, offsetX, offsetY,} = props
  const settings = useContext(SettingsContext)
  const ref = useRef(null)
  const contextMenu = useRef()
  const [isOpen, setOpen] = useState(false)
  const setMenuOpenState = (isMenuOpen) => {
    setOpen(isMenuOpen)
    if (isMenuOpen) {
      const hiddenDiv = contextMenu.current.firstChild
      hiddenDiv.setAttribute('role', 'menuitem')
      hiddenDiv.setAttribute('aria-hidden', 'true')
    }
  }

  return (
    <>
      <button
        aria-label={menuButtonLabel}
        className = {`btn btn-tertiary context-menu__drop${menuButtonClassName ? ` ${menuButtonClassName}` : ''}`}
        title={menuButtonLabel}
        type="button"
        ref={ref}
        onClick={() => setMenuOpenState(true)}
        aria-expanded={false}
        >
        <MenuButtonIcon/>
      </button>
      <ControlledMenu
        transition
        align={align}
        direction={direction}
        menuStyle={{padding: '5px'}}
        offsetX={offsetX}
        offsetY={offsetY}
        position='anchor'
        viewScroll='initial'
        portal={true}
        menuClassName={`context-menu context-menu--${settings.theme}`}
        state={isOpen ? 'open' : 'closed'}
        anchorRef={ref}
        ref={contextMenu}
        onClose={() => setMenuOpenState(false)}
      >
      {menuOptions.map((option, i) => (
        <MenuItem key={i} className='btn context-menu__item'  onClick={option.action} >
          <option.icon/>&nbsp;{option.text}
        </MenuItem>
      ))}
    </ControlledMenu>
  </>
    // <Menu menuButton={<MenuButton className={`btn btn-tertiary context-menu__drop${menuButtonClassName ? ` ${menuButtonClassName}` : ''}`} title={menuButtonLabel} aria-label={menuButtonLabel}><MenuButtonIcon/></MenuButton>}
    //   transition
    //   align={align}
    //   direction={direction}
    //   menuStyle={{padding: '5px'}}
    //   offsetX={offsetX}
    //   offsetY={offsetY}
    //   position='anchor'
    //   viewScroll='initial'
    //   portal={true}
    //   menuClassName={`context-menu context-menu--${settings.theme}`}
    // >
    //   {menuOptions.map((option, i) => (
    //     <MenuItem key={i} className='btn context-menu__item'  onClick={option.action} >
    //       <option.icon/>&nbsp;{option.text}
    //     </MenuItem>
    //   ))}
    // </Menu>
  )
}

export default ContextMenu
