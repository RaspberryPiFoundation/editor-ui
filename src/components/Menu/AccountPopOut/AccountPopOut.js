import React from "react"
import { LoginIcon, RemixIcon, SaveIcon, ShareIcon } from "../MenuIcons"
import MenuPopOutOption from "../MenuPopOutOption"

const AccountPopOut = () => {
  return (
    <div className = "menu-pop-out">
      <h2 className = "menu-pop-out-heading">Account</h2>
      <MenuPopOutOption Icon={ShareIcon} text='Share Project' onClickHandler={()=>{}}/>
      <MenuPopOutOption Icon={RemixIcon} text='Remix Project' onClickHandler={()=>{}}/>
      <MenuPopOutOption Icon={SaveIcon} text='Save Project' onClickHandler={()=>{}}/>
      <MenuPopOutOption Icon={LoginIcon} text='Log in' onClickHandler={()=>{}}/>
    </div>
  )
}

export default AccountPopOut
