import React from "react";
import { useCookies } from "react-cookie";
import { FontIcon } from "../../../Icons";
import './FontSizeSelector.scss'

const FontSizeSelector = () => {
  const [ cookies , setCookie] = useCookies(['fontSize'])
  const fontSize = cookies.fontSize || "small"
  return (
    <div className='font-size-selector'>
      <div className='font-btn font-btn--small' onClick={() => setCookie('fontSize', 'small')}>
        <div className={`font-btn__icon font-btn__icon--small ${fontSize==='small' ? 'font-btn__icon--active' : ''}`}>
          <FontIcon size={15}/>
        </div>
        <p>Small</p>
      </div>
      <div className='font-btn font-btn--medium' onClick={() => setCookie('fontSize', 'medium')}>
      <div className={`font-btn__icon font-btn__icon--medium ${fontSize==='medium' ? 'font-btn__icon--active' : ''}`}>
          <FontIcon size={23}/>
        </div>
        <p>Medium</p>
      </div>
      <div className='font-btn font-btn--large' onClick={() => setCookie('fontSize', 'large')}>
      <div className={`font-btn__icon font-btn__icon--large ${fontSize==='large' ? 'font-btn__icon--active' : ''}`}>
          <FontIcon size={36}/>
        </div>
        <p>Large</p>
      </div>
    </div>
  )
}

export default FontSizeSelector
