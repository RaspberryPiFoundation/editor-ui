import React, { useState } from "react"
import { faCircleUser, faDownload, faFile, faFont, faGear } from '@fortawesome/free-solid-svg-icons'

import AccountPopOut from "./AccountPopOut"
import FilePopOut from "./FilePopOut"
import SettingsPopOut from "./SettingsPopOut"
import MenuSideBar from "./MenuSidebar"

import './Menu.scss'

const Menu = () => {
  const menuOptions = [
      { name: "file", icon: faFile, position: "top", popOut: FilePopOut },
      { name: "download", icon: faDownload, position: "top" },
      { name: "font", icon: faFont, position: "top" },
      { name: "account", icon: faCircleUser, popOut: AccountPopOut, position: "bottom" },
      { name: "settings", icon: faGear, popOut: SettingsPopOut, position: "bottom" }
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
