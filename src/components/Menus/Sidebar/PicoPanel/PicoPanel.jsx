import React, { useState } from "react";
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
  const port = useSelector((state) => state.editor.picoPort);
  const writer = useSelector((state) => state.editor.picoWriter);

  const { t } = useTranslation();

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
            onClick={() => runOnPico(port, writer, project)}
            text="Run on pico"
            icon={<DuplicateIcon />}
            textAlways
          />
          <DesignSystemButton
            className="files-list-item"
            onClick={() => disconnectFromPico(port, writer, dispatch)}
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
            onClick={() =>
              readAllFilesFromPico(port, writer, project, dispatch)
            }
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
