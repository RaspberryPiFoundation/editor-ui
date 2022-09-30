import React from "react"

import RenameFile from '../../Modals/RenameFile'

const FileMenu = () => {
    return (
        <div className='dropdown-container dropdown-container--bottom file-menu'>
          <div className='file-menu__rename'>
            <RenameFile/>
          </div>
        </div>
    )
}
  
export default FileMenu