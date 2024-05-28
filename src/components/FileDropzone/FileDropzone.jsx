import React from "react";
import { useDropzone } from "react-dropzone";
import "material-symbols";

import "../../assets/stylesheets/FileDropzone.scss";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import classNames from "classnames";

const FileDropzone = ({
  hintText,
  clearFilesText,
  successText,
  files = [],
  onDropAccepted,
  clearFiles,
  allowedFileTypes,
  maxFiles,
}) => {
  const maxFilesReached = files.length >= maxFiles;
  const { getRootProps, getInputProps, isDragAccept } = useDropzone({
    onDropAccepted: onDropAccepted,
    accept: allowedFileTypes,
    maxFiles,
    disabled: maxFilesReached,
  });

  return (
    <>
      <div
        {...getRootProps({
          className: classNames("file-dropzone", {
            "file-dropzone--success": maxFilesReached,
            "file-dropzone--drag-accept": isDragAccept,
          }),
        })}
      >
        {maxFilesReached ? (
          <>
            <span className="file-dropzone__success-text">{successText}</span>
            {files.map((file, i) => (
              <span className="file-dropzone__file" key={i}>
                <span className="material-symbols-outlined">description</span>
                {file.path}
              </span>
            ))}
          </>
        ) : (
          <>
            <input id="csv-upload" {...getInputProps()} />
            <span className="material-symbols-outlined">place_item</span>
            <label className="file-dropzone__label" htmlFor="csv-upload">
              {hintText}
            </label>
            {files.map((file, i) => (
              <span className="file-dropzone__file" key={i}>
                <span className="material-symbols-outlined">description</span>
                {file.path}
              </span>
            ))}
          </>
        )}
      </div>

      <DesignSystemButton
        className="file-dropzone__remove"
        type="tertiary"
        icon="delete"
        text={clearFilesText}
        onClick={clearFiles}
      />
    </>
  );
};

export default FileDropzone;
