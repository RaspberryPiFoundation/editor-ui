import React, { useState } from "react"
import MenuPopOut from "./MenuPopOut"
import AccountPopOut from "./AccountPopOut"
import FilePopOut from "./FilePopOut"
import SettingsPopOut from "./SettingsPopOut"
import MenuSideBar from "./MenuSidebar"

import './Menu.scss'

const Menu = () => {
  const [menuOption, setMenuOption] = useState(null)
  const toggleMenuOption = (option) => {
    menuOption !== option ? setMenuOption(option) : setMenuOption(null)
  }
  return (
    <div className = "menu">
      <MenuSideBar optionClickHandler = {toggleMenuOption}/>
      {
        menuOption === 'file' ? <FilePopOut /> :
        menuOption === 'account' ? <AccountPopOut /> :
        menuOption === 'settings' ? <SettingsPopOut /> :
        null
      }
    </div>
  )
}

export default Menu
