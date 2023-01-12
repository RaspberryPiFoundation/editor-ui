import React from 'react';
import { useCookies } from 'react-cookie';
import { useTranslation } from 'react-i18next';

import './ThemeToggle.scss'
import { MoonIcon, SunIcon } from '../../Icons';

const ThemeToggle = () => {
  const [ cookies, setCookie, removeCookie ] = useCookies(['theme'])
  const isDarkMode = cookies.theme==="dark" || (!cookies.theme && window.matchMedia("(prefers-color-scheme:dark)").matches)
  const { t } = useTranslation()

  const setTheme = (theme) => {
    if (cookies.theme) {
      removeCookie('theme', { path: '/' })
      removeCookie('theme', { path: '/python' })
      removeCookie('theme', { path: '/projects' })
    }
    setCookie('theme', theme, { path: '/' })
  }

  return (
    <div className='theme-toggle'>
      <div className='theme-btn theme-btn--light' onClick={() => setTheme('light')}>
        <div className={`theme-btn__icon theme-btn__icon--light ${!isDarkMode ? 'theme-btn__icon--active' : null}`}>
          <SunIcon />
        </div>
        <p>{t('header.settingsMenu.themeOptions.light')}</p>
      </div>
      <div className='theme-btn theme-btn--dark' onClick={() => setTheme('dark')}>
        <div className={`theme-btn__icon theme-btn__icon--dark ${isDarkMode ? 'theme-btn__icon--active' : null}`}>
          <MoonIcon />
        </div>
        <p>{t('header.settingsMenu.themeOptions.dark')}</p>
      </div>
    </div>
  )
}

export default ThemeToggle
