import React, { useContext } from "react"
import { useDispatch } from 'react-redux'
import { useTranslation } from "react-i18next";
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';

import { SettingsContext } from '../../../settings'
import { showRenameFileModal } from '../../Editor/EditorSlice'
import { EllipsisVerticalIcon, PencilIcon } from '../../../Icons';
import './FileMenu.scss'

const FileMenu = (props) => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const settings = useContext(SettingsContext)

  const onClickRenameFile = () => dispatch(showRenameFileModal(props))

  const checkValidFilename = () => {
    const { name, ext } = props
    return !(name === 'main' && ext === 'py')
  }

  return (
    <Menu menuButton={<MenuButton className={`file-menu__drop`}><EllipsisVerticalIcon /></MenuButton>}
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
        <button className='btn' 
          {...(checkValidFilename() ? {onClick: onClickRenameFile} : {disabled: 'disabled'})}>
          <PencilIcon/>&nbsp;{t('filePane.fileMenu.renameItem')}
        </button>
      </MenuItem>
    </Menu>
  )
}
  
export default FileMenu
