import React, { useContext } from "react"
import { useDispatch } from 'react-redux'

import { ThemeContext } from '../../../Theme'
import { showRenameFileModal } from '../../Editor/EditorSlice'
import { PencilIcon } from '../../../Icons';
import './FileMenu.scss'

const FileMenu = (props) => {
  const dispatch = useDispatch()
  const theme = useContext(ThemeContext)

  const onClickRenameFile = () => dispatch(showRenameFileModal(props))

  console.log(props)

  return (
    <div className='file-menu__rename'>
      <button className={`btn--${theme}`} onClick={onClickRenameFile}>
        <PencilIcon/>&nbsp;Rename&nbsp;File
      </button>
    </div>
  )
}
  
export default FileMenu