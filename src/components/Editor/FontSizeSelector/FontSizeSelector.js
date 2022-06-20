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
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'black',
      color: 'white'
    },
    overlay: {
      zIndex: 1000,
      backgroundColor: "rgba(0,0,0,0)"
    }
  };

  return (
    <div className='font-size-selector'>
      <MenuPopOutOption appElement={document.getElementById('root') || undefined} icon = {faFont} text = {"Select font size"} onClickHandler={setOpen}/>
      { open ? (
        <Modal className="menu-dropdown" isOpen={open} onRequestClose={()=>setOpen(false)} style={customStyles}>
          <MenuPopOutOption text="Small" onClickHandler={() => setCookie('fontSize', 'small')}/>
          <MenuPopOutOption text="Medium" onClickHandler={() => setCookie('fontSize', 'medium')}/>
          <MenuPopOutOption text="Large" onClickHandler={() => setCookie('fontSize', 'large')}/>
        </Modal>
      ) : null}
      {/* <Button buttonText='Aa' className='btn-large-font' onClickHandler={() => setCookie('fontSize', 'large')}/>
      <Button buttonText='Aa'className='btn-medium-font' onClickHandler={() => setCookie('fontSize', 'medium')}/>
      <Button buttonText='Aa'className='btn-small-font' onClickHandler={() => setCookie('fontSize', 'small')}/> */}
    </div>
  )
}

export default FontSizeSelector
