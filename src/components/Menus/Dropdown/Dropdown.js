import React, { useEffect, useRef, useState } from "react";

import './Dropdown.scss'

const Dropdown = (props) => {
  const {ButtonIcon, buttonText, menuOptions, MenuContent} = props
  const [isOpen, setOpen] = useState(false)
  // const dropdown = useRef()
  
  // useEffect(() => {
  //   /**
  //    * Alert if clicked on outside of element
  //    */
  //   function handleClickOutside(event) {
  //     if (dropdown.current && !dropdown.current.contains(event.target)) {
  //       setOpen(false)
  //     }
  //   }
  //   // Bind the event listener
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     // Unbind the event listener on clean up
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [dropdown]);

  return (
    <div className='dropdown'>
      <div className='dropdown-button' onClick={() => setOpen(!isOpen)}>
        <ButtonIcon />
        <span>{buttonText}</span>
      </div>
      {isOpen ? <div className='dropdown-backdrop' onClick={() => setOpen(false)}></div> : null}
      {isOpen ?
      MenuContent ? <MenuContent/> :
      <div className='dropdown-container'>
        {menuOptions ? menuOptions.map((option, i) => (
          <p key={i}>{option}</p>
        )) : null }
      </div> : null }
    </div>
  )
}

export default Dropdown
