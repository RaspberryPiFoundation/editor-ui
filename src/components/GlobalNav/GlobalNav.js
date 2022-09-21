import React from "react";
import { useSelector } from "react-redux";
import { ChevronDown, RPFLogoIcon } from "../../Icons";
import Login from '../Login/Login';
import LoginMenu from "../Login/LoginMenu";
import Dropdown from "../Menus/Dropdown/Dropdown";
import './GlobalNav.scss';

const GlobalNav = () => {

  const user = useSelector((state) => state.auth.user)
  return (
    <div className='editor-global-nav'>
      <a href='https://www.raspberrypi.org/'>
        <img src='raspberrypi_logo.svg' alt="Raspberry Pi Logo" />
        <span>Raspberry Pi Foundation</span>
      </a>
      {user !== null ? 
        <Dropdown 
          buttonText='Profile menu'
          ButtonIcon={ChevronDown}
          MenuContent={LoginMenu}
        />
        : <Login />
      }
    </div>
  )
}

export default GlobalNav;
