import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import DesignSystemButton from "../../../DesignSystemButton/DesignSystemButton";

import "../../../../assets/stylesheets/FilePanel.scss";
import "../../../../assets/stylesheets/Sidebar.scss";
import SidebarPanel from "../SidebarPanel";
import DuplicateIcon from "../../../../assets/icons/duplicate.svg";

import { setPicoConnected } from "../../../../redux/EditorSlice";

import {
  downloadMicroPython,
  writeAllFilesToPico,
  readAllFilesFromPico,
} from "../../../../utils/picoHelpers";

const PicoPanel = ({ isMobile }) => {
  const picoBaudRate = 115200;

  const project = useSelector((state) => state.editor.project);
  const [port, setPort] = useState(null);
  const dispatch = useDispatch();

  const picoConnected = useSelector((state) => state.editor.picoConnected);

  const { t } = useTranslation();

  const connectToPico = async () => {
    const obtainedPort = await navigator.serial.requestPort();
    await obtainedPort.open({ baudRate: picoBaudRate });
    setPort(obtainedPort);
    dispatch(setPicoConnected(true));
  };

  const disconnectFromPico = async () => {
    if (port) {
      console.log(`Disconnecting ${port}`);
      await port.close();
      console.log(`Disconnected ${port}`);
      dispatch(setPicoConnected(false));
    }
    setPort(null);
  };

  useEffect(() => {
    const reconnectToPort = async () => {
      console.log("Getting port");
      const ports = await navigator.serial.getPorts();
      const port = ports[0];
      console.log(port);
      setPort(port);
    };
    if (picoConnected && !port) {
      reconnectToPort();
    }
  }, [port, picoConnected]);

  return (
    <SidebarPanel heading={t("filePanel.pico")}>
      {!picoConnected ? (
        <DesignSystemButton
          className="files-list-item"
          onClick={() => connectToPico()}
          text="Connect"
          type="secondary"
          icon={<DuplicateIcon />}
          textAlways
        />
      ) : (
        <>
          <DesignSystemButton
            className="files-list-item"
            onClick={() => disconnectFromPico()}
            text="Disconnect"
            type="secondary"
            icon={<DuplicateIcon />}
            textAlways
          />

          <DesignSystemButton
            className="files-list-item"
            onClick={downloadMicroPython}
            text="Download MicroPython"
            type="secondary"
            icon={<DuplicateIcon />}
            textAlways
          />

          <DesignSystemButton
            className="files-list-item"
            onClick={() => writeAllFilesToPico(port, project, dispatch)}
            text="Write to Pico"
            type="secondary"
            icon={<DuplicateIcon />}
            textAlways
          />
          <DesignSystemButton
            className="files-list-item"
            onClick={() => readAllFilesFromPico(port, project, dispatch)}
            text="Get files from Pico"
            type="secondary"
            icon={<DuplicateIcon />}
            textAlways
          />
        </>
      )}
    </SidebarPanel>
  );
};

export default PicoPanel;
