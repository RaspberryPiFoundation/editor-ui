import React from "react";

const FileMenu = () => {
    return (
      <div className='dropdown-container dropdown-container--bottom file-menu'>
        <div className='file-menu__rename'>
            Rename File <button onClick={showModal}><PencilIcon /></button>
        </div>
      </div>
    )
}
  
export default FileMenu