import React from "react";
import { RPFLogoIcon } from "../../Icons";
import LoginMenu from "../Login/LoginMenu";
import './GlobalNav.scss';

const GlobalNav = () => {
  return (
    <div className='global-nav'>
      <a href='https://www.raspberrypi.org/'>
        <RPFLogoIcon />
        <span>Raspberry Pi Foundation</span>
      </a>
      <LoginMenu />
    </div>
  )
}

export default GlobalNav;
