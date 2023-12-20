import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import FileMenu from "../../FileMenu/FileMenu";
import NewComponentButton from "../../../Editor/NewComponentButton/NewComponentButton";
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
import DuplicateIcon from "../../../../assets/icons/duplicate.svg";
import { syncWithPico } from "../../../../utils/apiCallHandler";

const FilePanel = ({ isMobile }) => {
  const project = useSelector((state) => state.editor.project);
  const openFiles = useSelector((state) => state.editor.openFiles);
  const dispatch = useDispatch();
  const [port, setPort] = useState();
  const [writer, setWriter] = useState();
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

  const syncProjectWithPico = () => {
    // use this to sync all files???
    syncWithPico(project.components);
  };

  const connectAndOpenREPL = async () => {
    const obtainedPort = await navigator.serial.requestPort();
    await obtainedPort.open({ baudRate: 115200 }); // this is the Pico Baud Rate?
    setPort(obtainedPort);
    const obtainedWriter = obtainedPort.writable.getWriter();
    setWriter(obtainedWriter);
  };

  const runOnPico = async () => {
    if (port && writer) {
      const codeString = project.components[0].content;
      const codeLines = codeString.split(/\r?\n|\r|\n/g);
      for (let i = 0; i < codeLines.length; i++) {
        await writer.write(new TextEncoder().encode(codeLines[i]));
        await writer.write(new TextEncoder().encode("\r"));
      }
    }
  };

  useEffect(() => {
    const readPort = async () => {
      const reader = port.readable.getReader();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        console.log(new TextDecoder().decode(value));
      }
    };
    if (port) {
      readPort();
    }
  }, [port]);

  return (
    <SidebarPanel heading={t("filePanel.files")} Button={NewComponentButton}>
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
          {(file.name === "main" && file.extension === "py") ||
          (file.name === "index" && file.extension === "html") ? null : (
            <div className="files-list-item__menu">
              <FileMenu
                fileKey={i}
                name={file.name}
                ext={file.extension}
                content={file.content}
              />
            </div>
          )}
        </div>
      ))}
      <DesignSystemButton
        className="files-list-item"
        onClick={runOnPico}
        text="Run on pico"
        icon={<DuplicateIcon />}
        textAlways
      />
      <DesignSystemButton
        className="files-list-item"
        onClick={connectAndOpenREPL}
        text="Connect"
        icon={<DuplicateIcon />}
        textAlways
      />
    </SidebarPanel>
  );
};

export default FilePanel;
