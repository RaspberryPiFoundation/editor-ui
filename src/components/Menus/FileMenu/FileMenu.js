import React, { useContext } from "react"
import { useDispatch } from 'react-redux'
import { useTranslation } from "react-i18next";
import { Menu, MenuButton, MenuItem } from '@szhsin/react-menu';

import { SettingsContext } from '../../../settings'
import { showRenameFileModal } from '../../Editor/EditorSlice'
import { EllipsisVerticalIcon, PencilIcon } from '../../../Icons';
import './FileMenu.scss'

const FileMenu = (props) => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const settings = useContext(SettingsContext)

  const onClickRenameFile = () => {
    dispatch(showRenameFileModal(props))
  }

  const checkValidFilename = () => {
    const { name, ext } = props
    return !(name === 'main' && ext === 'py')
  }

  return (
    <div onClick = {(e) => e.stopPropagation()}>
      <Menu menuButton={<MenuButton className={`btn btn-tertiary file-menu__drop`}><EllipsisVerticalIcon /></MenuButton>}
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
        <MenuItem className='btn file-menu__item file-menu__rename'  {...(checkValidFilename() ? {onClick: onClickRenameFile} : {disabled: 'disabled'})} >
          <PencilIcon/>&nbsp;{t('filePane.fileMenu.renameItem')}
        </MenuItem>
      </Menu>
    </div>
  )
}
  
export default FileMenu
