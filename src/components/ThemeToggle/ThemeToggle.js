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
  const isDarkMode = cookies.theme==="dark" || (!cookies.theme && window.matchMedia("(prefers-color-scheme:dark)").matches)

  return (
    <div className='theme-toggle'>
      <div className={`theme-btn theme-btn__light ${!isDarkMode ? 'theme-btn--active' : null}`} onClick={() => setCookie('theme', 'light')}>
      <div className='theme-btn__icon'>
          <SunIcon />
        </div>
        <p>Light</p>
      </div>
      <div className={`theme-btn theme-btn__dark ${isDarkMode ? 'theme-btn--active' : null}`} onClick={() => setCookie('theme', 'dark')}>
        <div className='theme-btn__icon'>
          <MoonIcon />
        </div>
        <p>Dark</p>
      </div>
    </div>
  )
}

export default ThemeToggle
