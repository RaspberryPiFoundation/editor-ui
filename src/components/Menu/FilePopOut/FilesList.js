import React, { useState } from "react";
import { faEllipsisVertical, faFile } from '@fortawesome/free-solid-svg-icons'
import { FileIcon } from "../MenuIcons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useSelector } from "react-redux";

const FilesList = () => {
  const project = useSelector((state) => state.editor.project)

  return (
    <details className = "menu-pop-out-section" open>
      <summary>
        <h3 className="menu-pop-out-subheading" >All Files</h3>
      </summary>
      { project.components.map((file, i) => (
      <div className='files-list-item' key={i}>
        <FileIcon />
        <p className='file-list-item-name'>{file.name}.{file.extension}</p>
        {/* <FontAwesomeIcon icon={faEllipsisVertical} /> */}
      </div>
      ))}
    </details>
  )
}

export default FilesList
