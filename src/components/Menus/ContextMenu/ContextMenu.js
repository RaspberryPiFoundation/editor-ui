import { Menu, MenuButton, MenuItem } from "@szhsin/react-menu";
import React, { useContext } from "react";
import { EllipsisVerticalIcon, PencilIcon } from "../../../Icons";
import { SettingsContext } from "../../../settings";

import './ContextMenu.scss'

const ContextMenu = (props) => {

  const { align, direction, menuButtonClassName, MenuButtonIcon, menuOptions } = props
  const settings = useContext(SettingsContext)

  return (
    <Menu menuButton={<MenuButton className={`btn btn-tertiary context-menu__drop${menuButtonClassName ? ` ${menuButtonClassName}` : ''}`}><MenuButtonIcon/></MenuButton>}
    transition
    align={align}
    direction={direction}
    menuStyle={{padding: '5px'}}
    offsetX={15}
    offsetY={-10}
    position='anchor'
    viewScroll='initial'
    portal={true}
    menuClassName={`context-menu context-menu--${settings.theme} context-menu--${settings.fontSize}`}
    >
      {menuOptions.map((option, i) => (
        <MenuItem key={i} className='btn context-menu__item'  onClick={option.action} >
          <option.icon/>&nbsp;{option.text}
        </MenuItem>
      ))}
    </Menu>
  )
}

export default ContextMenu
