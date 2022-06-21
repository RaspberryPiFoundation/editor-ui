import { faFont } from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import { useCookies } from "react-cookie";
import Modal from "react-modal";
import MenuPopOutOption from "../../Menu/MenuPopOutOption";
import './FontSizeSelector.scss'

const FontSizeSelector = () => {
  const [ , setCookie] = useCookies(['fontSize'])
  const [open, setOpen] = useState(false)

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      backgroundColor: 'white',
      color: 'black',
      width: 'fit-content',
      position: 'relative',
      padding: 'var(--spacing-1)',
      borderRadius: '5px'
    },
    overlay: {
      zIndex: 1000,
      backgroundColor: "rgba(0,0,0,0)"
    }
  };

  return (
    <div className='font-size-selector' id='font-size-pop-out-option'>
      <MenuPopOutOption icon = {faFont} text = {"Select font size"} onClickHandler={() => setOpen(true)}/>
      <Modal appElement={document.getElementById('font-size-pop-out-option') || undefined} className="menu-dropdown" isOpen={open} onRequestClose={()=>setOpen(false)} style={customStyles}>
        <MenuPopOutOption text="Small" onClickHandler={() => setCookie('fontSize', 'small')}/>
        <MenuPopOutOption text="Medium" onClickHandler={() => setCookie('fontSize', 'medium')}/>
        <MenuPopOutOption text="Large" onClickHandler={() => setCookie('fontSize', 'large')}/>
      </Modal>
      {/* <Button buttonText='Aa' className='btn-large-font' onClickHandler={() => setCookie('fontSize', 'large')}/>
      <Button buttonText='Aa'className='btn-medium-font' onClickHandler={() => setCookie('fontSize', 'medium')}/>
      <Button buttonText='Aa'className='btn-small-font' onClickHandler={() => setCookie('fontSize', 'small')}/> */}
    </div>
  )
}

export default FontSizeSelector
