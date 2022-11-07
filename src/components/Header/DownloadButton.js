import FileSaver from "file-saver";
import { toSnakeCase } from "js-convert-case";
import JSZip from "jszip";
import JSZipUtils from "jszip-utils";
import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { DownloadIcon } from "../../Icons";
import Button from "../Button/Button";

const DownloadButton = () => {

  const { t } = useTranslation()
  const project = useSelector((state) => state.editor.project)

  const urlToPromise = (url) => {
    return new Promise(function(resolve, reject) {
      JSZipUtils.getBinaryContent(url, function (err, data) {
        if(err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  const onClickDownload = async () => {
    const zip = new JSZip()

    project.components.forEach((file) => {
      zip.file(`${file.name}.${file.extension}`, file.content)
    })

    project.image_list.forEach((image) => {
      zip.file(image.filename, urlToPromise(image.url), {binary: true} )
    })

    const content = await zip.generateAsync({type: 'blob'})
    FileSaver.saveAs(content, `${toSnakeCase(project.name || t('header.downloadFileNameDefault', {project_type: project.project_type}))}`)
  }

  return (
    <Button
      className='btn--tertiary'
      onClickHandler={onClickDownload}
      buttonText={t('header.download')}
      ButtonIcon={DownloadIcon}
    />
  )
}

export default DownloadButton
