import React from "react";
import { useSelector } from "react-redux";
import { ChevronDown, RPFLogoIcon } from "../../Icons";
import Login from '../Login/Login';
import LoginMenu from "../Login/LoginMenu";
import Dropdown from "../Menus/Dropdown/Dropdown";
import './GlobalNav.scss';
import rpf_logo from '../../assets/raspberrypi_logo.svg'
import user_logo from '../../assets/unauthenticated_user.svg'

const GlobalNav = () => {

  const user = useSelector((state) => state.auth.user)
  return (
    <div className="editor-global-nav-wrapper">
      <div className='editor-global-nav'>
        <a className='editor-global-nav__home' href='https://www.raspberrypi.org/'>
          <img src={rpf_logo} alt="Raspberry Pi Logo" />
          <span>Raspberry Pi Foundation</span>
        </a>
        <div className='editor-global-nav__account'>
          <Dropdown
            buttonImage={user ? user.profile.picture : user_logo}
            buttonImageAltText={user ? `${user.profile.name}'s account` : 'Account menu'}
            ButtonIcon={ChevronDown}
            MenuContent={LoginMenu}
          />
        </div>
      </div>
    </div>
  )
}

export default GlobalNav;
