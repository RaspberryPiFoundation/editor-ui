import React from "react";

import FontSizeSelector from "../../Editor/FontSizeSelector/FontSizeSelector";
import ThemeToggle from "../../ThemeToggle/ThemeToggle";
import './SettingsMenu.scss'
import { useTranslation } from 'react-i18next';

const SettingsMenu = () => {

  const {t} = useTranslation()

  return (
    <div className='dropdown-container dropdown-container--bottom settings-menu'>
      <h2>{t('header.settingsMenu.heading')}</h2>
      <div className='settings-menu__theme'>
        <h3>{t('header.settingsMenu.theme')}</h3>
        <ThemeToggle />
      </div>
      <div className='settings-menu__font-size'>
        <h3>{t('header.settingsMenu.textSize')}</h3>
        <FontSizeSelector />
      </div>
    </div>
  )
}

export default SettingsMenu
