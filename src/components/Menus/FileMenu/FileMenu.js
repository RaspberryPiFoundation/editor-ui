import React from "react"
import { useSelector } from "react-redux"
import ProjectImages from "./ProjectImages/ProjectImages"
import FilesList from "./FilesList"

import './FileMenu.scss'

const FileMenu = () => {

  const project = useSelector((state) => state.editor.project)

  return (
    <div className = "file-menu">
      <FilesList />
      {project.image_list && project.image_list.length>0? <ProjectImages /> : null}
    </div>
  )
}

export default FileMenu
