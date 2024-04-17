import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import DesignSystemButton from "../../../DesignSystemButton/DesignSystemButton";

import "../../../../assets/stylesheets/FilePanel.scss";
import "../../../../assets/stylesheets/Sidebar.scss";
import SidebarPanel from "../SidebarPanel";
import DuplicateIcon from "../../../../assets/icons/duplicate.svg";

import {
  downloadMicroPython,
  writeAllFilesToPico,
  readAllFilesFromPico,
  runOnPico,
  disconnectFromPico,
  connectToPico,
} from "../../../../utils/picoHelpers";
import { set } from "date-fns";

const PicoPanel = ({ isMobile }) => {
  const project = useSelector((state) => state.editor.project);
  const dispatch = useDispatch();
  const picoConnected = useSelector((state) => state.editor.picoConnected);
  const [port, setPort] = useState(null);

  const { t } = useTranslation();

  useEffect(() => {
    const getPort = async () => {
      const ports = await navigator.serial.getPorts();
      if (ports.length > 0) {
        setPort(ports[0]);
      }
    };

    if (picoConnected && !port) {
      getPort();
    }
  }, [picoConnected, port]);

  return (
    <SidebarPanel heading={t("filePanel.pico")}>
      {!port && (
        <DesignSystemButton
          className="files-list-item"
          onClick={() => connectToPico(dispatch)}
          text="Connect"
          icon={<DuplicateIcon />}
          textAlways
        />
      )}
      {port && (
        <>
          <DesignSystemButton
            className="files-list-item"
            onClick={() => runOnPico(port, project)}
            text="Run on pico"
            icon={<DuplicateIcon />}
            textAlways
          />
          <DesignSystemButton
            className="files-list-item"
            onClick={() => disconnectFromPico(port, dispatch)}
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
            onClick={() => writeAllFilesToPico(port, project)}
            text="Write to Pico"
            icon={<DuplicateIcon />}
            textAlways
          />
          <DesignSystemButton
            className="files-list-item"
            onClick={() => readAllFilesFromPico(port, project, dispatch)}
            text="Get files from Pico"
            icon={<DuplicateIcon />}
            textAlways
          />
        </>
      )}
    </SidebarPanel>
  );
};

export default PicoPanel;
