import React from "react"
import { useDispatch } from 'react-redux'

import { showRenameFileModal } from '../../Editor/EditorSlice'

const FileMenu = (props) => {
  const dispatch = useDispatch()

  const onClickRenameFile = () => dispatch(showRenameFileModal(...props))

  return (
      <div className='dropdown-container dropdown-container--bottom file-menu'>
        <div className='file-menu__rename'>
          <button onClick={onClickRenameFile}>Rename&nbsp;File</button>
        </div>
      </div>
  )
}
  
export default FileMenu