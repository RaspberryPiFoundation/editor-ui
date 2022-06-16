import React from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleUser, faDownload, faFile, faFont, faGear } from '@fortawesome/free-solid-svg-icons'
// import { faCircleUser } from '@fortawesome/fontawesome-svg-core'

const MenuSideBar = (props) => {
  const {optionClickHandler} = props
  
  const selectFileOption = () => {
    optionClickHandler('file')
  }
  const selectAccountOption = () => {
    optionClickHandler('account')
  }
  const selectSettingsOption = () => {
    optionClickHandler('settings')
  }

  return (
    <div className="menu-sidebar">
      <div className="menu-options-top">
      <FontAwesomeIcon icon={faFile} onClick={selectFileOption}/>
      <FontAwesomeIcon icon={faDownload} />
      <FontAwesomeIcon icon={faFont} />
      </div>
      <div className="menu-options-bottom">
        <FontAwesomeIcon icon={faCircleUser} onClick={selectAccountOption}/>
        <FontAwesomeIcon icon={faGear} onClick={selectSettingsOption}/>
      </div>
    </div>
  )
}

export default MenuSideBar
