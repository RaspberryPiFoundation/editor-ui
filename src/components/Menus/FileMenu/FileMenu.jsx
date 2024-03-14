import React from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import { showRenameFileModal } from "../../../redux/EditorSlice";
import EllipsisVerticalIcon from "../../../assets/icons/ellipsis_vertical.svg";
import PencilIcon from "../../../assets/icons/pencil.svg";
import ContextMenu from "../ContextMenu/ContextMenu";

const FileMenu = (props) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const onClickRenameFile = () => {
    dispatch(showRenameFileModal(props));
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <ContextMenu
        align="start"
        direction="right"
        menuButtonLabel={t("filePanel.fileMenu.label")}
        MenuButtonIcon={EllipsisVerticalIcon}
        menuOptions={[
          {
            icon: PencilIcon,
            text: t("filePanel.fileMenu.renameItem"),
            action: onClickRenameFile,
          },
        ]}
        offsetX={16}
        offsetY={-8}
      />
    </div>
  );
};

export default FileMenu;
