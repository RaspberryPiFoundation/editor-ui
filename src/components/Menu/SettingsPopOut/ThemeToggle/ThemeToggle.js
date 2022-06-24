import React from 'react';
import { useCookies } from 'react-cookie';
import { faCircleHalfStroke } from '@fortawesome/free-solid-svg-icons';
import MenuPopOutOption from '../../MenuPopOutOption';
import { ThemeIcon } from '../../MenuIcons';

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
    <MenuPopOutOption
    Icon={ThemeIcon}
    onClickHandler={toggleDarkMode}
    text={`Switch to ${isDarkMode?"light":"dark"} mode`} />
  )
}

export default ThemeToggle
