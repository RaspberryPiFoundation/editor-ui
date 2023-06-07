import FileSaver from "file-saver";
import { toSnakeCase } from "js-convert-case";
import JSZip from "jszip";
import JSZipUtils from "jszip-utils";
import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import Button from "../Button/Button";
import { closeLoginToSaveModal } from "../Editor/EditorSlice";

const DownloadButton = (props) => {
  const { buttonText, className, Icon } = props;
  const { t } = useTranslation();
  const project = useSelector((state) => state.editor.project);
  const loginToSaveModalShowing = useSelector(
    (state) => state.editor.loginToSaveModalShowing,
  );
  const dispatch = useDispatch();

  const urlToPromise = (url) => {
    return new Promise(function (resolve, reject) {
      JSZipUtils.getBinaryContent(url, function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  };

  const onClickDownload = async () => {
    if (loginToSaveModalShowing) {
      dispatch(closeLoginToSaveModal());
    }
    const zip = new JSZip();

    project.components.forEach((file) => {
      zip.file(`${file.name}.${file.extension}`, file.content);
    });

    project.image_list.forEach((image) => {
      zip.file(image.filename, urlToPromise(image.url), { binary: true });
    });

    const content = await zip.generateAsync({ type: "blob" });
    FileSaver.saveAs(
      content,
      `${toSnakeCase(
        project.name ||
          t("header.downloadFileNameDefault", {
            project_type: project.project_type,
          }),
      )}`,
    );
  };

  return (
    <Button
      className={className}
      onClickHandler={onClickDownload}
      buttonText={buttonText}
      ButtonIcon={Icon}
    />
  );
};

export default DownloadButton;
