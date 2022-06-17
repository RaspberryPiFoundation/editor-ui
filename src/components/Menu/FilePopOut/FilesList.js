import React, { useState } from "react";
import { faEllipsisVertical, faFile } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useSelector } from "react-redux";

const FilesList = () => {
  const project = useSelector((state) => state.editor.project)
  const [open, setOpen] = useState(true)

  const toggleOpen = () => {
    setOpen(!open)
  }

  return (
    <div>
      <h3 className="menu-pop-out-subheading" onClick={toggleOpen}>All Files</h3>
      { open ? project.components.map((file, i) => (
        <div className='files-list-item' key={i}>
          <FontAwesomeIcon icon={faFile}/>
          <p className='file-list-item-name'>{file.name}.{file.extension}</p>
          {/* <FontAwesomeIcon icon={faEllipsisVertical} /> */}
        </div>
      )) : null }
    </div>
  )
}

export default FilesList
