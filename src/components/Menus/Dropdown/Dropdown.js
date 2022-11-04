import React, { useEffect, useRef, useState } from "react";
import Button from "../../Button/Button";

import './Dropdown.scss'

const Dropdown = (props) => {
  const {ButtonIcon, buttonImage, buttonImageAltText, buttonText, MenuContent} = props
  const [isOpen, setOpen] = useState(false)
  const dropdown = useRef()
  
  useEffect(() => {
    /**
     * Close menu if clicked outside of element
     */
    function handleClickOutside(event) {
      if (dropdown.current && !dropdown.current.contains(event.target)) {
        setOpen(false)
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdown]);

  return (
    <div className='dropdown' ref={dropdown}>
      <Button
        className={`btn--tertiary dropdown-button${isOpen ? ' dropdown-button--active' : ''}`}
        onClickHandler={() => setOpen(!isOpen)}
        buttonText={buttonText}
        ButtonIcon={ButtonIcon}
        buttonImage={buttonImage}
        buttonImageAltText={buttonImageAltText}
      />
      
      {isOpen ? 
      <>
        <div className='dropdown-backdrop' onClick={() => setOpen(false)}></div>
        <MenuContent />
      </> : null}
    </div>
  )
}

export default Dropdown
