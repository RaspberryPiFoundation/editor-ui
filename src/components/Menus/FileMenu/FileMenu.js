import React, { useContext } from "react"
import { useDispatch } from 'react-redux'
import { useTranslation } from "react-i18next";
import { Menu, MenuButton, MenuItem } from '@szhsin/react-menu';

import { SettingsContext } from '../../../settings'
import { showRenameFileModal } from '../../Editor/EditorSlice'
import { EllipsisVerticalIcon, PencilIcon } from '../../../Icons';
import ContextMenu from "../ContextMenu/ContextMenu";

const FileMenu = (props) => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const settings = useContext(SettingsContext)

  const onClickRenameFile = () => {
    dispatch(showRenameFileModal(props))
  }

  return (
    <div onClick = {(e) => e.stopPropagation()}>
      <ContextMenu
        align = 'start'
        direction = 'right'
        MenuButtonIcon = {EllipsisVerticalIcon}
        menuOptions = {[
          {
            icon: PencilIcon,
            text: t('filePane.fileMenu.renameItem'),
            action: onClickRenameFile
          }
        ]}
      />
    </div>
  )
}
  
export default FileMenu
