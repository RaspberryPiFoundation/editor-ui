import React from "react";
import FileSaver from "file-saver";
import { toSnakeCase } from "js-convert-case";
import JSZip from "jszip";
import JSZipUtils from "jszip-utils";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

import { Button } from "@raspberrypifoundation/design-system-react";

const DownloadButton = (props) => {
  const { text, className, type = "secondary", ...otherProps } = props;
  const { t } = useTranslation();
  const project = useSelector((state) => state.editor.project);

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
    if (window.plausible) {
      window.plausible("Download");
    }

    const zip = new JSZip();

    if (project.instructions) {
      zip.file("INSTRUCTIONS.md", project.instructions);
    }

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
          })
      )}`
    );
  };

  return (
    <Button
      className={className}
      onClick={onClickDownload}
      icon="download"
      text={text}
      fullWidth
      type={type}
      {...otherProps}
    />
  );
};

DownloadButton.propTypes = {
  buttonText: PropTypes.string,
  className: PropTypes.string,
  Icon: PropTypes.func,
};

export default DownloadButton;
