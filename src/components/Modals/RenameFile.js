import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { validateFileName } from "../../utils/componentNameValidation";
import Button from "../Button/Button";
import {
  closeRenameFileModal,
  updateComponentName,
} from "../Editor/EditorSlice";
import "../../Modal.scss";
import InputModal from "./InputModal";

const RenameFile = () => {
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

  const renameComponent = () => {
    const fileName = document.getElementById("name").value;
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
      heading={t("filePane.renameFileModal.heading")}
      inputLabel={t("filePane.renameFileModal.inputLabel")}
      inputDefaultValue={`${currentName}.${currentExtension}`}
      defaultCallback={renameComponent}
      buttons={[
        <Button
          className="btn--primary"
          buttonText={t("filePane.renameFileModal.save")}
          onClickHandler={renameComponent}
        />,
        <Button
          className="btn--secondary"
          buttonText={t("filePane.renameFileModal.cancel")}
          onClickHandler={closeModal}
        />,
      ]}
    />
  );
};

export default RenameFile;
