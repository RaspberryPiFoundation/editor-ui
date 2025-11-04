import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import useNewComponentButton from "../../../../hooks/useNewComponentButton";

import FileMenu from "../../FileMenu/FileMenu";
import DesignSystemButton from "../../../DesignSystemButton/DesignSystemButton";
import {
  openFile,
  setFocussedFileIndex,
  hideSidebar,
} from "../../../../redux/EditorSlice";

import "../../../../assets/stylesheets/FilePanel.scss";
import "../../../../assets/stylesheets/Sidebar.scss";
import SidebarPanel from "../SidebarPanel";
import FileIcon from "../../../../utils/FileIcon";

const FilePanel = ({ isMobile }) => {
  const project = useSelector((state) => state.editor.project);
  const openFiles = useSelector((state) => state.editor.openFiles);
  const readOnly = useSelector((state) => state.editor.readOnly);

  const dispatch = useDispatch();
  const newFileButtons = useNewComponentButton();

  const switchToFileTab = (panelIndex, fileIndex) => {
    dispatch(setFocussedFileIndex({ panelIndex, fileIndex }));
  };

  const openFileTab = (fileName) => {
    if (openFiles.flat().includes(fileName)) {
      const panelIndex = openFiles
        .map((fileNames) => fileNames.includes(fileName))
        .indexOf(true);
      const fileIndex = openFiles[panelIndex].indexOf(fileName);
      switchToFileTab(panelIndex, fileIndex);
    } else {
      dispatch(openFile(fileName));
      switchToFileTab(0, openFiles[0].length);
    }
    if (isMobile) {
      dispatch(hideSidebar());
    }
  };
  const { t } = useTranslation();

  const buttons = readOnly ? [] : newFileButtons;

  if (!project || !project.components) {
    return null;
  }

  return (
    <SidebarPanel heading={t("filePanel.files")} buttons={buttons}>
      {project.components.map((file, i) => (
        <div className="files-list-item-wrapper" key={i}>
          <DesignSystemButton
            className="files-list-item"
            onClick={() => openFileTab(`${file.name}.${file.extension}`)}
            text={`${file.name}.${file.extension}`}
            icon={<FileIcon ext={file.extension} />}
            type="tertiary"
            textAlways
            small
          />
          {readOnly ||
          (file.name === "main" && file.extension === "py") ||
          (file.name === "index" && file.extension === "html") ? null : (
            <div className="files-list-item__menu">
              <FileMenu fileKey={i} name={file.name} ext={file.extension} />
            </div>
          )}
        </div>
      ))}
    </SidebarPanel>
  );
};

export default FilePanel;
