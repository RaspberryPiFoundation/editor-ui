import React from "react"
import { useSelector } from "react-redux"
import ProjectImages from "./ProjectImages/ProjectImages"
import FilesList from "./FilesList"
import ResizableWithHandle from '../../../../utils/ResizableWithHandle';

import './FilePane.scss'

const FilePane = (props) => {

  const project = useSelector((state) => state.editor.project)
  const {openFileTab} = props

  return (
    <ResizableWithHandle className='file-pane' minWidth='200px' maxWidth='500px'>
      <FilesList openFileTab = {openFileTab}/>
      {project.image_list && project.image_list.length>0? <ProjectImages /> : null}
    </ResizableWithHandle>
  )
}

export default FilePane
