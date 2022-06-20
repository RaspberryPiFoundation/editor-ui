import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const MenuPopOutOption = (props) => {
  const {icon, text, onClickHandler} = props;
  return (
    <div className = "menu-pop-out-option" onClick = {onClickHandler} >
      { icon ? (<FontAwesomeIcon icon={icon} />) : null }
      <span className = "menu-pop-out-option-text">{text}</span>
    </div>
  )
}

export default MenuPopOutOption;
