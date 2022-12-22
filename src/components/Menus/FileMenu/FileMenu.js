import React, { useContext, useRef, useState } from "react"
import { useDispatch } from 'react-redux'
import { useTranslation } from "react-i18next";
import { MenuItem, ControlledMenu } from '@szhsin/react-menu';

import { SettingsContext } from '../../../settings'
import { showRenameFileModal } from '../../Editor/EditorSlice'
import { EllipsisVerticalIcon, PencilIcon } from '../../../Icons';
import './FileMenu.scss'
import Button from "../../Button/Button";

const FileMenu = (props) => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const settings = useContext(SettingsContext)
  const menuButton = useRef()
  const [isOpen, setOpen] = useState(false)

  const openMenu = (e) => {
    e.stopPropagation()
    setOpen(true)
  }

  const onClickRenameFile = (e) => {
    e.syntheticEvent.stopPropagation()
    dispatch(showRenameFileModal(props))
  }

  const checkValidFilename = () => {
    const { name, ext } = props
    return !(name === 'main' && ext === 'py')
  }

  return (
    <>
      <Button className='btn-tertiary file-menu__drop' ButtonIcon={EllipsisVerticalIcon} onClickHandler={(e) => openMenu(e)} ref={menuButton}/>
      <ControlledMenu
            state={isOpen ? 'open' : 'closed'}
            anchorRef={menuButton}
            onClose={() => setOpen(false)}
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
        <MenuItem className='btn file-menu__item file-menu__rename' {...(checkValidFilename() ? {onClick: (e) => onClickRenameFile(e)} : {disabled: 'disabled'})} >
          <PencilIcon/>&nbsp;{t('filePane.fileMenu.renameItem')}
        </MenuItem>
      </ControlledMenu>
    </>
  )
}
  
export default FileMenu
