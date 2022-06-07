import React from "react";
import { useCookies } from "react-cookie";
import Button from "../../Button/Button";
import './FontSizeSelector.scss'

const FontSizeSelector = () => {
  const [ , setCookie] = useCookies(['fontSize'])
  return (
    <div className='font-size-selector'>
      <Button buttonText='Aa' className='btn-large-font' onClickHandler={() => setCookie('fontSize', 'large')}/>
      <Button buttonText='Aa'className='btn-medium-font' onClickHandler={() => setCookie('fontSize', 'medium')}/>
      <Button buttonText='Aa'className='btn-small-font' onClickHandler={() => setCookie('fontSize', 'small')}/>
    </div>
  )
}

export default FontSizeSelector
