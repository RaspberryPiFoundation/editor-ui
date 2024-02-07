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

  const connectAndOpenREPL = async () => {
    const obtainedPort = await navigator.serial.requestPort();
    await obtainedPort.open({ baudRate: 115200 }); // this is the Pico Baud Rate?
    setPort(obtainedPort);
    const obtainedWriter = obtainedPort.writable.getWriter();
    setWriter(obtainedWriter);
  };

  const disconnect = async () => {
    if (port && writer) {
      console.log(`Disconnecting ${writer}`);
      await writer.releaseLock();
      console.log(`Disconnecting ${port}`);
      await port.close();
      console.log(`Disconnected ${port}`);
    }
  };

  const downloadMicroPython = async () => {
    console.log("Installing!!");
    try {
      const fileUrl =
        "https://micropython.org/download/rp2-pico/rp2-pico-latest.uf2";

      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = "rp2-pico-latest.uf2";
      document.body.appendChild(link);
      link.click();
      return "Success";
    } catch (error) {
      return error;
    }
  };

  const syncWithPico = async () => {
    const encoder = new TextEncoder();
    const writeFile = async (component) => {
      console.log("Writing");
      console.log(component);
      const fileWriteString = `with open('${component.name}.py', 'w') as file:`;
      console.log(fileWriteString);
      const codeString = project.components[0].content;
      const codeLines = codeString.split(/\r?\n|\r|\n/g);
      await writer.write(encoder.encode(fileWriteString));
      await writer.write(encoder.encode("\r"));
      for (let i = 0; i < codeLines.length; i++) {
        const line = `    file.write('${codeLines[i]}'\n)`;
        await writer.write(encoder.encode(line));
        await writer.write(encoder.encode("\r"));
      }
      await writer.write(encoder.encode("\r"));
      console.log("Done writing!");
    };

    if (port && writer) {
      // for (let i = 0; i < project.components.length; i++) {
      for (const component of project.components) {
        await writeFile(component);
      }
    }
  };

  const runOnPico = async () => {
    console.log("trying to run on pico");
    if (port && writer) {
      console.log("Have port and writer");
      const codeString = project.components[0].content;
      const codeLines = codeString.split(/\r?\n|\r|\n/g);
      for (let i = 0; i < codeLines.length; i++) {
        await writer.write(new TextEncoder().encode(codeLines[i]));
        await writer.write(new TextEncoder().encode("\r"));
      }
    }
  };

  // NEEDS Reworking: doesn't provide constant stream and doesn't close reader properly (preventing disconnect)
  // useEffect(() => {
  //   const decoder = new TextDecoder();
  //   const readPort = async () => {
  //     const reader = port.readable.getReader();
  //     while (true) {
  //       const { value, done } = await reader.read();
  //       if (done) {
  //         await reader.releaseLock();

  //         break;
  //       }
  //       console.log(decoder.decode(value));
  //     }
  //   };
  //   if (port) {
  //     readPort();
  //   }
  // }, [port]);

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
      <DesignSystemButton
        className="files-list-item"
        onClick={disconnect}
        text="Disconnect"
        icon={<DuplicateIcon />}
        textAlways
      />

      <DesignSystemButton
        className="files-list-item"
        onClick={downloadMicroPython}
        text="Download MicroPython"
        icon={<DuplicateIcon />}
        textAlways
      />

      <DesignSystemButton
        className="files-list-item"
        onClick={syncWithPico}
        text="Sync with Pico"
        icon={<DuplicateIcon />}
        textAlways
      />
    </SidebarPanel>
  );
};

export default FilePanel;
