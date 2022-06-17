import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

const MenuSidebarOption = (props) => {
  const { icon, isActive, name, toggleOption } = props

  const onClickHandler = () => {
    toggleOption(name)
  }

  return (
    <div className={`menu-sidebar-option${isActive ? " --active":""}`} onClick = {onClickHandler}>
      <FontAwesomeIcon icon={icon} />
    </div>
  )


}

export default MenuSidebarOption
