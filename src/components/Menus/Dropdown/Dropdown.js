import React, { useState } from "react";

import './Dropdown.scss'

const Dropdown = (props) => {
  const {ButtonIcon, buttonText, menuOptions, MenuContent} = props
  const [isOpen, setOpen] = useState(false)
  return (
    <div className='dropdown'>
      <div className='dropdown-button' onClick={() => setOpen(!isOpen)}>
        <ButtonIcon />
        <span>{buttonText}</span>
      </div>
      {isOpen ?
      MenuContent ? <MenuContent className='dropdown-container' /> :
      <div className='dropdown-container'>
        { MenuContent ? <MenuContent /> :
        menuOptions ? menuOptions.map((option, i) => (
          <p key={i}>{option}</p>
        )) : null }

      </div> : null}
    </div>
  )
}

export default Dropdown
