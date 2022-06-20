import React from "react"
import FontSizeSelector from "../../Editor/FontSizeSelector/FontSizeSelector"
import ThemeToggle from "./ThemeToggle/ThemeToggle"

const SettingsPopOut = () => {
  return (
    <div className = "menu-pop-out">
      <h2 className = "menu-pop-out-heading">Settings</h2>
      <ThemeToggle />
      <FontSizeSelector />
    </div>
  )
}

export default SettingsPopOut
