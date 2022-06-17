import React from "react"
import { useSelector } from "react-redux"
import ProjectImages from "../Editor/ProjectImages/ProjectImages"

const FilePopOut = () => {

  const project = useSelector((state) => state.editor.project)

  return (
    <div className = "menu-pop-out">
      <h2 className = "menu-pop-out-heading">File</h2>
      { project.components.map((file, i) => (
          <p key={i}>{file.name}.{file.extension}</p>
        )
      )}
      {project.image_list && project.image_list.length>0? <ProjectImages /> : null}
    </div>
  )
}

export default FilePopOut
