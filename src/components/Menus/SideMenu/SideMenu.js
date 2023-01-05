import React, { useState } from "react"
import { FileIcon } from "../../../Icons"
import FilePane from "./FilePane/FilePane"
import MenuSideBar from "./MenuSideBar"

import './SideMenu.scss'

const SideMenu = () => {
  const menuOptions = [
    { name: "file", icon: FileIcon, position: "top", popOut: FilePane }
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
    <div className = "side_menu">
      { option ? null :
        <MenuSideBar menuOptions={menuOptions} option={option} toggleOption = {toggleOption}/>
      }
      <MenuPopOut />
    </div>
  )
}

export default SideMenu
