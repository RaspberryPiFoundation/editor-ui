import React from "react"
import { ExpandIcon } from "../../../Icons"
import Button from "../../Button/Button"
import MenuSideBarOption from "./MenuSideBarOption"


const MenuSideBar = (props) => {
  const {menuOptions, option, toggleOption} = props
  const topMenuOptions = menuOptions.filter((menuOption => menuOption.position==="top"))
  const bottomMenuOptions = menuOptions.filter((menuOption => menuOption.position==="bottom"))

  return (
    <div className="menu-sidebar">
      <div className={`menu-options-top`}>
        {topMenuOptions.map((menuOption, i) => (
            <MenuSideBarOption key={i} Icon={menuOption.icon} isActive={option===menuOption.name} toggleOption={toggleOption} name={menuOption.name}/>
          ))}
      </div>
      <div className={`menu-options-bottom`}>
        {bottomMenuOptions.map((menuOption, i) => (
            <MenuSideBarOption key={i} Icon={menuOption.icon} isActive={option===menuOption.name} toggleOption={toggleOption} name={menuOption.name}/>
          ))}
        <Button className='btn--secondary btn--small' ButtonIcon={ExpandIcon} onClickHandler={() => toggleOption('file')}/>
      </div>
    </div>
  )
}

export default MenuSideBar
