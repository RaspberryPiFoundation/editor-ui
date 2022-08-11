import React from "react";
import FontSizeSelector from "../../Editor/FontSizeSelector/FontSizeSelector";
import ThemeToggle from "../../ThemeToggle/ThemeToggle";
import './SettingsMenu.scss'

const SettingsMenu = () => {
  return (
    <div className='dropdown-container settings-menu'>
      <h2>Settings</h2>
      <div className='settings-menu__theme'>
        <h3>Color Mode</h3>
        <ThemeToggle />
      </div>
      <div className='settings-menu__font-size'>
        <h3>Text Size</h3>
        <FontSizeSelector />
      </div>
    </div>
  )
}

export default SettingsMenu
