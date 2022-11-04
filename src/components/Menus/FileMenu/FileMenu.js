import React, { useContext } from "react"
import { useDispatch } from 'react-redux'
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';

import { SettingsContext } from '../../../settings'
import { showRenameFileModal } from '../../Editor/EditorSlice'
import { EllipsisVerticalIcon, PencilIcon } from '../../../Icons';
import './FileMenu.scss'

const FileMenu = (props) => {
  const dispatch = useDispatch()
  const settings = useContext(SettingsContext)

  const onClickRenameFile = () => dispatch(showRenameFileModal(props))

  console.log(props)

  return (
    <Menu menuButton={<MenuButton><EllipsisVerticalIcon /></MenuButton>}
          transition
          align='start'
          direction='right'
          menuStyle={{padding: '5px'}}
          offsetX={15}
          offsetY={-10}
          position='anchor'
          viewScroll='initial'
          portal={true}
          menuClassName={`file-menu file-menu--${settings.theme} file-menu--${settings.fontSize}`}
        >
      <MenuItem className='file-menu__item file-menu__rename'>
        <button className='btn' onClick={onClickRenameFile}>
          <PencilIcon/>&nbsp;Rename&nbsp;File
        </button>
      </MenuItem>
    </Menu>
  )
}
  
export default FileMenu