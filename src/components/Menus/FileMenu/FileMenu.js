import React from "react"
import { useDispatch } from 'react-redux'

import { showRenameFileModal } from '../../Editor/EditorSlice'
import { PencilIcon } from '../../../Icons';
import './FileMenu.scss'

const FileMenu = (props) => {
  const dispatch = useDispatch()

  const onClickRenameFile = () => dispatch(showRenameFileModal(props))

  console.log(props)

  return (
      <div >{/*className='dropdown-container dropdown-container--bottom file-menu'>*/}
        <div >{/*className='file-menu__rename'>*/}
          <button className='btn file-menu__rename-btn' onClick={onClickRenameFile}>
            <PencilIcon/>&nbsp;Rename&nbsp;File
          </button>
        </div>
      </div>
  )
}
  
export default FileMenu