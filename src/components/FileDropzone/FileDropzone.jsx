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
  const { getRootProps, getInputProps } = useDropzone({
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
          }),
        })}
      >
        {maxFilesReached ? (
          <>
            <span className="file-dropzone__success-text">{successText}</span>
            {files.map((file, i) => (
              <p key={i}>{file.path}</p>
            ))}
          </>
        ) : (
          <>
            <input {...getInputProps()} />
            <span className="material-symbols-outlined">place_item</span>
            {hintText}
            {files.map((file, i) => (
              <p key={i}>{file.path}</p>
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
