import React from 'react';
import { useCookies } from 'react-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon } from '@fortawesome/free-solid-svg-icons'
import { DaySunny } from '@intern0t/react-weather-icons';
import Button from '../Button/Button';

import './ThemeToggle.scss'
import { MoonIcon, SunIcon } from '../../Icons';

const ThemeToggle = () => {
  const [ cookies, setCookie ] = useCookies(['theme'])

  const toggleDarkMode = () => {
    if ((cookies.theme && cookies.theme==='dark') || (!cookies.theme && window.matchMedia("(prefers-color-scheme:dark)").matches)) {
      setCookie('theme', 'light')
    }
    else {
      setCookie('theme', 'dark')
    }
  }
  const isDarkMode = cookies.theme==="dark" || (!cookies.theme && window.matchMedia("(prefers-color-scheme:dark)").matches)

  return (
    // <Button
    //   className = "toggle-theme-btn"
    //   onClickHandler={toggleDarkMode}
    //   buttonText = {
    //     isDarkMode ? <DaySunny size={"2em"}/> : <FontAwesomeIcon icon = {faMoon} size = {"2x"} />
    //   }
    // />
    <div className='theme-toggle'>
      <div className={`theme-btn theme-btn__light ${!isDarkMode ? 'theme-btn--active' : null}`} onClick={() => setCookie('theme', 'light')}>
        <SunIcon />
        <p>Light</p>
      </div>
      <div className={`theme-btn theme-btn__dark ${isDarkMode ? 'theme-btn--active' : null}`} onClick={() => setCookie('theme', 'dark')}>
        <MoonIcon />
        <p>Dark</p>
      </div>
    </div>
  )
}

export default ThemeToggle
