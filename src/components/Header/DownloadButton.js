import FileSaver from "file-saver";
import { toSnakeCase } from "js-convert-case";
import JSZip from "jszip";
import JSZipUtils from "jszip-utils";
import React from "react";
import { useSelector } from "react-redux";
import { DownloadIcon } from "../../Icons";
import Button from "../Button/Button";

const DownloadButton = () => {

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

  const onClickDownload = () => {
    const zip = new JSZip()

    console.log(project)

    project.components.forEach((file) => {
      zip.file(`${file.name}.${file.extension}`, file.content)
    })

    project.image_list.forEach((image) => {
      zip.file(image.filename, urlToPromise(image.url), {binary: true} )
    })

    zip.generateAsync({type: 'blob'}).then((content) => {
      FileSaver.saveAs(content, `${toSnakeCase(project.name)}`)
    })
  }

  return (
    <Button
      className='btn--tertiary'
      onClickHandler={onClickDownload}
      buttonText='Download'
      ButtonIcon={DownloadIcon}
    />
  )
}

export default DownloadButton
