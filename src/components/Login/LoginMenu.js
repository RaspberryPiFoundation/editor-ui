import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Login from "./Login";
import './LoginMenu.scss'

const LoginMenu = () => {

  const { t } = useTranslation()
  const user = useSelector((state) => state.auth.user)

  return (
    <div className = 'dropdown-container dropdown-container--bottom dropdown-container--list login-menu'>
      {user !== null ?
      <>
        <a className='dropdown-container--list__item' href={`${user.profile.profile}/edit`}>{t('globalNav.accountMenu.profile')}</a>
        <a className='dropdown-container--list__item' href='/projects'>{t('globalNav.accountMenu.projects')}</a>
      </>
      : null
    }
      <Login className='dropdown-container--list__item'/>
    </div>
  ) 
}

export default LoginMenu
