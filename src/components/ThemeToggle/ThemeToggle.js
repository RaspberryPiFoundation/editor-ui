import React from 'react';
import { useCookies } from 'react-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon } from '@fortawesome/free-solid-svg-icons'
import { DaySunny } from '@intern0t/react-weather-icons';
import Button from '../Button/Button';

import './ThemeToggle.scss'

const ThemeToggle = () => {
  const [ cookies, setCookie ] = useCookies(['theme'])

  const toggleDarkMode = () => {
    if (cookies.theme && cookies.theme=='dark' || !cookies.theme && window.matchMedia("(prefers-color-scheme:dark)").matches) {
      setCookie('theme', 'light')
    }
    else {
      setCookie('theme', 'dark')
    }
  }

  return (
    <Button
      className = "toggle-theme-btn"
      onClickHandler={toggleDarkMode}
      buttonText = {
        cookies.theme=='dark' ? <DaySunny color={"white"} size={"2em"}/> : <FontAwesomeIcon icon = {faMoon} size = {"2x"} />
      }
    />
  )
}

export default ThemeToggle
