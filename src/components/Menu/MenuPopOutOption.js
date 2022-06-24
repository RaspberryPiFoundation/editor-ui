import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const MenuPopOutOption = (props) => {
  const {Icon, text, onClickHandler} = props;
  return (
    <div className = "menu-pop-out-option" onClick = {onClickHandler} >
      { Icon ? (<Icon/>) : null }
      <span className = "menu-pop-out-option-text">{text}</span>
    </div>
  )
}

export default MenuPopOutOption;
