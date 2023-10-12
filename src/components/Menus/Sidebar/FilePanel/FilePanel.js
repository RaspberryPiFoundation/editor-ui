import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { FileIcon, DuplicateIcon } from "../../../../Icons";
import FileMenu from "../../FileMenu/FileMenu";
import NewComponentButton from "../../../Editor/NewComponentButton/NewComponentButton";
import Button from "../../../Button/Button";
import {
  openFile,
  setFocussedFileIndex,
  hideSidebar,
} from "../../../Editor/EditorSlice";

import "./FilePanel.scss";
import "../Sidebar.scss";
import SidebarPanel from "../SidebarPanel";
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
    let device = await navigator.usb.requestDevice({
      filters: [
        {
          vendorId: 0x2e8a, // This is the Raspberry Pi Vendor ID
        },
      ],
    });
    await device.open();
    await device.selectConfiguration(1);
    await device.claimInterface(1);
    let writing = await device.transferOut(
      2,
      new Uint8Array(new TextEncoder().encode("Test value\n")),
    );
    console.log(writing);
    console.log("READING");
    let result = await device.transferIn(2, 4);
    console.log("RESULT");
    console.log(result.status);
    let bytes = await result.data.getUint8();
    console.log(bytes);
    await device.close();
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
        onClickHandler={() => syncProjectWithPico()}
        buttonText="Sync Pico"
        ButtonIcon={DuplicateIcon}
      />
      <Button
        className="btn btn--secondary files-list__pico_sync-button"
        onClickHandler={() => connectToPico()}
        buttonText="Connect"
        ButtonIcon={DuplicateIcon}
      />
    </SidebarPanel>
  );
};

export default FilePanel;
