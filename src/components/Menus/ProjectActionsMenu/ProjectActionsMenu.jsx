import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { BinIcon, EllipsisVerticalIcon, PencilIcon } from "../../../Icons";
import {
  showDeleteProjectModal,
  showRenameProjectModal,
} from "../../../redux/EditorSlice";
import ContextMenu from "../ContextMenu/ContextMenu";

const ProjectActionsMenu = (props) => {
  const { project } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const openRenameProjectModal = () => {
    dispatch(showRenameProjectModal(project));
  };

  const openDeleteProjectModal = () => {
    dispatch(showDeleteProjectModal(project));
  };

  return (
    <ContextMenu
      align="end"
      direction="bottom"
      menuButtonLabel={t("projectList.label")}
      menuButtonClassName="editor-project-list__menu"
      MenuButtonIcon={EllipsisVerticalIcon}
      menuOptions={[
        {
          icon: PencilIcon,
          text: t("projectList.rename"),
          action: openRenameProjectModal,
        },
        {
          icon: BinIcon,
          text: t("projectList.delete"),
          action: openDeleteProjectModal,
        },
      ]}
      offsetX={-10}
    />
  );
};

export default ProjectActionsMenu;
