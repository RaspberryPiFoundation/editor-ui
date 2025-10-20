import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { validateFileName } from "../../utils/componentNameValidation";
import { Button } from "@raspberrypifoundation/design-system-react";
import {
  closeRenameFileModal,
  updateComponentName,
} from "../../redux/EditorSlice";
import "../../assets/stylesheets/Modal.scss";
import InputModal from "./InputModal";

const RenameFileModal = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const projectType = useSelector((state) => state.editor.project.project_type);
  const projectComponents = useSelector(
    (state) => state.editor.project.components,
  );
  const isModalOpen = useSelector(
    (state) => state.editor.renameFileModalShowing,
  );
  const {
    name: currentName,
    ext: currentExtension,
    fileKey,
  } = useSelector((state) => state.editor.modals.renameFile);
  const componentNames = projectComponents.map(
    (component) => `${component.name}.${component.extension}`,
  );

  const closeModal = () => dispatch(closeRenameFileModal());
  const [fileName, setFileName] = useState(
    `${currentName}.${currentExtension}`,
  );

  const renameComponent = () => {
    const name = fileName.split(".")[0];
    const extension = fileName.split(".").slice(1).join(".");

    validateFileName(
      fileName,
      projectType,
      componentNames,
      dispatch,
      t,
      () => {
        dispatch(
          updateComponentName({
            key: fileKey,
            extension: extension,
            name: name,
          }),
        );
        closeModal();
      },
      `${currentName}.${currentExtension}`,
    );
  };

  return (
    <InputModal
      isOpen={isModalOpen}
      closeModal={closeModal}
      withCloseButton
      heading={t("filePanel.renameFileModal.heading")}
      inputs={[
        {
          label: t("filePanel.renameFileModal.inputLabel"),
          value: fileName,
          setValue: setFileName,
          validateName: true,
        },
      ]}
      defaultCallback={renameComponent}
      buttons={[
        <Button
          key="rename"
          type="primary"
          text={t("filePanel.renameFileModal.save")}
          onClick={renameComponent}
        />,
        <Button
          key="close"
          type="tertiary"
          text={t("filePanel.renameFileModal.cancel")}
          onClick={closeModal}
        />,
      ]}
    />
  );
};

export default RenameFileModal;
