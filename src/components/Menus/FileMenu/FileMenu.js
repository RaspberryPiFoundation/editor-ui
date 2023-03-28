import React from "react"
import { useDispatch } from 'react-redux'
import { useTranslation } from "react-i18next";
import { gql } from '@apollo/client'

import { showRenameFileModal } from '../../Editor/EditorSlice'
import { EllipsisVerticalIcon, PencilIcon } from '../../../Icons';
import ContextMenu from "../ContextMenu/ContextMenu";

export const FILE_MENU_FRAGMENT = gql`
  fragment FileMenuFragment on Component {
    id
    name
    extension
  }
`

export const FileMenu = (props) => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { fileData } = props

  const onClickRenameFile = () => {
    dispatch(showRenameFileModal({name: fileData.name, componentId: fileData.id, extension: fileData.extension}))
  }

  return (
    <div onClick = {(e) => e.stopPropagation()}>
      <ContextMenu
        align = 'start'
        direction = 'right'
        menuButtonLabel={t('filePane.fileMenu.label')}
        MenuButtonIcon = {EllipsisVerticalIcon}
        menuOptions = {[
          {
            icon: PencilIcon,
            text: t('filePane.fileMenu.renameItem'),
            action: onClickRenameFile
          }
        ]}
        offsetX={15}
        offsetY={-10}
      />
    </div>
  )
}

