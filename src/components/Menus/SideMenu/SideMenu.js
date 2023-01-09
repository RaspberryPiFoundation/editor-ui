import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { DoubleChevronLeft, FileIcon } from "../../../Icons"
import Button from "../../Button/Button"
import FilePane from "./FilePane/FilePane"
import MenuSideBar from "./MenuSideBar"

import './SideMenu.scss'

const SideMenu = (props) => {
  const { openFileTab } = props
  const { t } = useTranslation()
  const menuOptions = [
    { name: "file", icon: FileIcon, title: t('sideMenu.file'), position: "top", popOut: () => FilePane({ openFileTab: openFileTab }) }
  ]
  const [option, setOption] = useState('file')
  const toggleOption = (newOption) => {
    option !== newOption ? setOption(newOption) : setOption(null)
  }

  const optionDict = menuOptions.find((menuOption) => {
    return menuOption.name === option
  })
  const MenuPopOut = optionDict && optionDict.popOut ? optionDict.popOut : () => {}

  const collapsePopOut = () => {
    toggleOption(option)
    window.plausible('Collapse file pane')
  }

  return (
    <div className = "menu">
      { option ? null :
        <MenuSideBar menuOptions={menuOptions} option={option} toggleOption = {toggleOption}/>
      }
      <MenuPopOut />
      {option ?
        <Button className='btn--secondary btn--small' ButtonIcon={DoubleChevronLeft} buttonOuter buttonOuterClassName = 'menu-collapse-button' title={t('sideMenu.collapse')} onClickHandler={collapsePopOut} />
      : null
      }
    </div>
  )
}

export default SideMenu
