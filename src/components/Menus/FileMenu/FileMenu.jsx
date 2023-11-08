import React from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import { showRenameFileModal } from "../../../redux/EditorSlice";
import EllipsisVerticalIcon from "../../../assets/icons/ellipsis_vertical.svg";
import PencilIcon from "../../../assets/icons/pencil.svg";
import ContextMenu from "../ContextMenu/ContextMenu";
import { writeToPico } from "../../../utils/apiCallHandler";

const FileMenu = (props) => {
  const content = props.content;
  const fileName = `${props.name}.py`;
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const onClickRenameFile = () => {
    dispatch(showRenameFileModal(props));
  };

  const onClickSyncWithPico = () => {
    writeToPico(fileName, content);
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
          {
            icon: DuplicateIcon,
            text: "Sync with Pico",
            action: onClickSyncWithPico,
          },
        ]}
        offsetX={15}
        offsetY={-10}
      />
    </div>
  );
};

export default FileMenu;
