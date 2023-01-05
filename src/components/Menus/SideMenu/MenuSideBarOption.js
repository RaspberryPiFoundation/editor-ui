import React from "react"

const MenuSidebarOption = (props) => {
  const { Icon, isActive, name, toggleOption } = props

  const onClickHandler = () => {
    toggleOption(name)
  }

  return (
    <div className={`menu-sidebar-option${isActive ? " --active":""}`} onClick = {onClickHandler}>
      <Icon />
    </div>
  )
}

export default MenuSidebarOption
