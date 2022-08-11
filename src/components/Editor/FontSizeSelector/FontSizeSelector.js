import React from "react";
import { useCookies } from "react-cookie";
import { FontIcon } from "../../../Icons";
import Button from "../../Button/Button";
import './FontSizeSelector.scss'

const FontSizeSelector = () => {
  const [ cookies , setCookie] = useCookies(['fontSize'])
  const fontSize = cookies.fontSize || "small"
  return (
    <div className='font-size-selector'>
      <div className={`font-btn font-btn__small ${fontSize==='small' ? 'font-btn--active' : ''}`} onClick={() => setCookie('fontSize', 'small')}>
        <div className='font-btn__icon'>
          <FontIcon size={15}/>
        </div>
        <p>Small</p>
      </div>
      <div className={`font-btn font-btn__medium ${fontSize==='medium' ? 'font-btn--active' : ''}`} onClick={() => setCookie('fontSize', 'medium')}>
      <div className='font-btn__icon'>
          <FontIcon size={23}/>
        </div>
        <p>Medium</p>
      </div>
      <div className={`font-btn font-btn__large ${fontSize==='large' ? 'font-btn--active' : ''}`} onClick={() => setCookie('fontSize', 'large')}>
      <div className='font-btn__icon'>
          <FontIcon size={36}/>
        </div>
        <p>Large</p>
      </div>
    </div>
  )
}

export default FontSizeSelector
