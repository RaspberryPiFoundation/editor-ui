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

const PicoPanel = ({ isMobile }) => {
  const project = useSelector((state) => state.editor.project);
  const dispatch = useDispatch();

  const picoConnected = useSelector((state) => state.editor.picoConnected);

  const { t } = useTranslation();

  return (
    <SidebarPanel heading={t("filePanel.pico")}>
      {!picoConnected ? (
        <DesignSystemButton
          className="files-list-item"
          onClick={() => connectToPico(dispatch)}
          text="Connect"
          icon={<DuplicateIcon />}
          textAlways
        />
      ) : (
        <>
          <DesignSystemButton
            className="files-list-item"
            onClick={() => runOnPico(project, dispatch)}
            text="Run on pico"
            icon={<DuplicateIcon />}
            textAlways
          />
          <DesignSystemButton
            className="files-list-item"
            onClick={() => disconnectFromPico(dispatch)}
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
            onClick={() => writeAllFilesToPico(project, dispatch)}
            text="Write to Pico"
            icon={<DuplicateIcon />}
            textAlways
          />
          <DesignSystemButton
            className="files-list-item"
            onClick={() => readAllFilesFromPico(project, dispatch)}
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
