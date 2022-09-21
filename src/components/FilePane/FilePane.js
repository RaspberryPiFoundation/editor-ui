import React from "react"
import { useSelector } from "react-redux"
import ProjectImages from "./ProjectImages/ProjectImages"
import FilesList from "./FilesList"

import './FilePane.scss'

const FilePane = () => {

  const project = useSelector((state) => state.editor.project)

  return (
    <div className = "file-pane">
      <FilesList />
      {project.image_list && project.image_list.length>0? <ProjectImages /> : null}
    </div>
  )
}

export default FilePane
