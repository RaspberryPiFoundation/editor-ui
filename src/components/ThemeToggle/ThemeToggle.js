import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon } from '@fortawesome/free-solid-svg-icons'
import { DaySunny } from '@intern0t/react-weather-icons';
import { useDispatch, useSelector } from 'react-redux';
import { setDarkMode } from '../Editor/EditorSlice'
import Button from '../Button/Button';

import './ThemeToggle.scss'

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.editor.darkModeEnabled);

  return (
    <Button className = "toggle-theme-btn" onClickHandler={() => dispatch(setDarkMode(!isDarkMode))} buttonText = {isDarkMode ? <DaySunny color={"white"} size={"2em"}/> : <FontAwesomeIcon icon = {faMoon} size = {"2x"} />}/>
  )
}

export default ThemeToggle
