import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { EllipsisVerticalIcon, PencilIcon } from "../../../Icons";
import { showRenameProjectModal } from "../../Editor/EditorSlice";
import ContextMenu from "../ContextMenu/ContextMenu";

const ProjectActionsMenu = (props) => {
  const { project } = props
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const openRenameProjectModal = () => {
    dispatch(showRenameProjectModal(project))
  }

  return (
    <ContextMenu
      align = 'end'
      direction = 'bottom'
      menuButtonClassName = 'editor-project-list__menu'
      MenuButtonIcon = {EllipsisVerticalIcon}
      menuOptions = {[
        {
          icon: PencilIcon,
          text: t('projectList.rename'),
          action: openRenameProjectModal
        }
      ]}
      offsetX={-10}
    />
  )
}

export default ProjectActionsMenu
