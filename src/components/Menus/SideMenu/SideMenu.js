import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { gql } from '@apollo/client'
import { DoubleChevronLeft, FileIcon } from "../../../Icons"
import Button from "../../Button/Button"
import { FilePane, FILE_PANE_FRAGMENT } from "./FilePane/FilePane"
import MenuSideBar from "./MenuSideBar"

import './SideMenu.scss'

export const SIDE_MENU_FRAGMENT = gql`
  fragment SideMenuFragment on Project {
    ...FilePaneFragment
  }
  ${FILE_PANE_FRAGMENT}
`

export const SideMenu = (props) => {
  const { openFileTab, sideMenuData } = props
  const { t } = useTranslation()
  const menuOptions = [
    { name: "file", icon: FileIcon, title: t('sideMenu.file'), position: "top", popOut: () => FilePane({ openFileTab: openFileTab, filePaneData: sideMenuData }) }
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

