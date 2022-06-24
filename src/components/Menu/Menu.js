import React, { useState } from "react"
import { faCircleUser, faDownload, faFile, faFont, faGear } from '@fortawesome/free-solid-svg-icons'
import { AccountIcon, FileIcon, FontIcon, SettingsIcon } from './MenuIcons'

import AccountPopOut from "./AccountPopOut/AccountPopOut"
import FilePopOut from "./FilePopOut/FilePopOut"
import SettingsPopOut from "./SettingsPopOut/SettingsPopOut"
import MenuSideBar from "./MenuSidebar"

import './Menu.scss'

const Menu = () => {
  const menuOptions = [
      { name: "file", icon: FileIcon, position: "top", popOut: FilePopOut },
      // { name: "download", icon: faDownload, position: "top" },
      { name: "font", icon: FontIcon, position: "top" },
      { name: "account", icon: AccountIcon, popOut: AccountPopOut, position: "bottom" },
      { name: "settings", icon: SettingsIcon, popOut: SettingsPopOut, position: "bottom" }
  ]
  const [option, setOption] = useState(null)
  const toggleOption = (newOption) => {
    option !== newOption ? setOption(newOption) : setOption(null)
  }

  const optionDict = menuOptions.find((menuOption) => {
    return menuOption.name === option
  })
  const MenuPopOut = optionDict && optionDict.popOut ? optionDict.popOut : () => {}

  return (
    <div className = "menu">
      <MenuSideBar menuOptions={menuOptions} option={option} toggleOption = {toggleOption}/>
      <MenuPopOut />
    </div>
  )
}

export default Menu
