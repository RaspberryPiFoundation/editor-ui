import React from 'react';
import { useCookies } from 'react-cookie';

import './ThemeToggle.scss'
import { MoonIcon, SunIcon } from '../../Icons';

const ThemeToggle = () => {
  const [ cookies, setCookie ] = useCookies(['theme'])
  const isDarkMode = cookies.theme==="dark" || (!cookies.theme && window.matchMedia("(prefers-color-scheme:dark)").matches)

  return (
    <div className='theme-toggle'>
      <div className='theme-btn theme-btn__light' onClick={() => setCookie('theme', 'light')}>
        <div className={`theme-btn__icon theme-btn__icon--light ${!isDarkMode ? 'theme-btn__icon--active' : null}`}>
          <SunIcon />
        </div>
        <p>Light</p>
      </div>
      <div className='theme-btn theme-btn__dark' onClick={() => setCookie('theme', 'dark')}>
        <div className={`theme-btn__icon theme-btn__icon--dark ${isDarkMode ? 'theme-btn__icon--active' : null}`}>
          <MoonIcon />
        </div>
        <p>Dark</p>
      </div>
    </div>
  )
}

export default ThemeToggle
