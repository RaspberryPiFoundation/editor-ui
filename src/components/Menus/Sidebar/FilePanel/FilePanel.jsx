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

import {
  addProjectComponent,
  updateProjectComponent,
} from "../../../../redux/EditorSlice";
import "../../../../assets/stylesheets/FilePanel.scss";
import "../../../../assets/stylesheets/Sidebar.scss";
import SidebarPanel from "../SidebarPanel";
import FileIcon from "../../../../utils/FileIcon";
import DuplicateIcon from "../../../../assets/icons/duplicate.svg";

import {
  downloadMicroPython,
  writeAllFilesToPico,
  readFromPico,
} from "../../../../utils/picoHelpers";

const FilePanel = ({ isMobile }) => {
  const project = useSelector((state) => state.editor.project);
  const openFiles = useSelector((state) => state.editor.openFiles);
  const dispatch = useDispatch();
  const [port, setPort] = useState();
  const [writer, setWriter] = useState();
  const switchToFileTab = (panelIndex, fileIndex) => {
    dispatch(setFocussedFileIndex({ panelIndex, fileIndex }));
  };

  const updateProject = (files) => {
    files.forEach((file) => {
      let fileExists = false;
      const filename = file.name.replace(/\.py$/, "");

      project.components.forEach((component) => {
        if (component.name === filename) {
          fileExists = true;
        }
      });

      if (!fileExists) {
        dispatch(addProjectComponent({ extension: "py", name: filename }));
      }

      dispatch(
        updateProjectComponent({
          extension: "py",
          name: filename,
          code: file.contents,
        })
      );
    });
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

  const readAllFilesFromPico = async (port, writer) => {
    const encoder = new TextEncoder();
    let files = [];
    if (port && writer) {
      // for (let i = 0; i < project.components.length; i++) {
      // // const fileListString = `import os\rfiles = os.listdir()\rprint(files)\r\n`;
      // // await writer.write(encoder.encode(fileListString));
      // // const fileList = await readFromPico();
      // console.log(fileList);
      const fileListString = `import ujson\rimport os\rfiles = os.listdir('/')\r`;
      await writer.write(encoder.encode(fileListString));
      const fileReadString = `for filename in files:\r    with open(filename, 'r') as file:\r        contents = file.read()\r        data = {\r            "name": filename,\r            "contents": contents\r        }\r        print(ujson.dumps(data))\r\r`;
      await writer.write(encoder.encode(fileReadString));
      const fileStream = await readFromPico(port);
      fileStream.forEach((file) => {
        if (file.includes("name") && file.includes("contents")) {
          try {
            // Is there a better way that doesn't use regex??!!
            const regex = /{([^}]*)}/;
            const rawFile = file.match(regex);

            const jsonFile = JSON.parse(rawFile[0].toString());
            console.log(jsonFile);
            files.push(jsonFile);
          } catch (error) {
            console.log(error);
          }
        }
      });
    }

    console.log("Files");
    console.log(files);
    updateProject(files);
  };

  const runOnPico = async () => {
    if (port && writer) {
      console.log("Running on Pico");
      const codeString = project.components[0].content;
      const codeLines = codeString.split(/\r?\n|\r|\n/g);
      let completeCode = "";
      for (let i = 0; i < codeLines.length; i++) {
        completeCode += `${codeLines[i]}\r`;
      }
      await writer.write(new TextEncoder().encode(`${completeCode}\r`));
      await readFromPico();
    }
  };

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
        onClick={() => writeAllFilesToPico(port, writer, project)}
        text="Write to Pico"
        icon={<DuplicateIcon />}
        textAlways
      />
      <DesignSystemButton
        className="files-list-item"
        onClick={() => readAllFilesFromPico(port, writer)}
        text="Get files from Pico"
        icon={<DuplicateIcon />}
        textAlways
      />
    </SidebarPanel>
  );
};

export default FilePanel;
