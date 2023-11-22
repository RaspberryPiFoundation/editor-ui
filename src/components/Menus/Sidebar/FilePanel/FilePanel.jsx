import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import FileMenu from "../../FileMenu/FileMenu";
import NewComponentButton from "../../../Editor/NewComponentButton/NewComponentButton";
import Button from "../../../Button/Button";
// import {
//   openFile,
//   setFocussedFileIndex,
//   hideSidebar,
// } from "../../../Editor/EditorSlice";

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

  const connectToPico = async () => {
    let port = await navigator.serial.requestPort();
    console.log(port);
    await port.open({ baudRate: 115200 });
    const textEncoder = new window.TextEncoderStream();

    const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);

    const writer = textEncoder.writable.getWriter();

    await writer.write("hello");

    // Allow the serial port to be closed later.
    writer.releaseLock();
    // 115200 is the pico baud rate
    console.log("Port readable?");
    console.log(port.readable);
    const textDecoder = new window.TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    // Listen to data coming from the serial device.
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        // Allow the serial port to be closed later.
        reader.releaseLock();
        break;
      }
      // value is a string.
      console.log("READING RESULT");
      console.log(value);
    }

    console.log("Out");
    port.close();
  };

  const readPico = async () => {
    console.log("READING");
  };

  return (
    <SidebarPanel heading={t("filePanel.files")} Button={NewComponentButton}>
      {project.components.map((file, i) => (
        <div className="files-list-item-wrapper" key={i}>
          <Button
            className="files-list-item"
            onClickHandler={() => openFileTab(`${file.name}.${file.extension}`)}
            buttonText={`${file.name}.${file.extension}`}
            ButtonIcon={() => FileIcon({ ext: file.extension })}
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
      <Button
        className="btn btn--secondary files-list__pico_sync-button"
        onClickHandler={syncProjectWithPico}
        buttonText="Sync Pico"
        ButtonIcon={DuplicateIcon}
      />
      <Button
        className="btn btn--secondary files-list__pico_sync-button"
        onClickHandler={connectToPico}
        buttonText="Connect"
        ButtonIcon={DuplicateIcon}
      />
      <Button
        className="btn btn--secondary files-list__pico_sync-button"
        onClickHandler={readPico}
        buttonText="Read"
        ButtonIcon={DuplicateIcon}
      />
    </SidebarPanel>
  );
};

export default FilePanel;
