import React from "react"
import MenuSidebarOption from "./MenuSidebarOption"


const MenuSideBar = (props) => {
  const {menuOptions, option, toggleOption} = props
  const topMenuOptions = menuOptions.filter((menuOption => menuOption.position==="top"))
  const bottomMenuOptions = menuOptions.filter((menuOption => menuOption.position==="bottom"))

  return (
    <div className="menu-sidebar">
      <div className={`menu-options-top`}>
        {topMenuOptions.map((menuOption, i) => (
            <MenuSidebarOption key={i} icon={menuOption.icon} isActive={option===menuOption.name} toggleOption={toggleOption} name={menuOption.name}/>
          ))}
      </div>
      <div className={`menu-options-bottom`}>
        {bottomMenuOptions.map((menuOption, i) => (
            <MenuSidebarOption key={i} icon={menuOption.icon} isActive={option===menuOption.name} toggleOption={toggleOption} name={menuOption.name}/>
          ))}
      </div>
    </div>
  )
}

export default MenuSideBar
