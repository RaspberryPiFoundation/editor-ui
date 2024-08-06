import React from "react";
import { useSelector } from "react-redux";
import { createPortal } from "react-dom";

const ExternalFiles = () => {
  const project = useSelector((state) => state.editor.project);
  const hostElement = document.body;

  if (!hostElement) {
    return null;
  }

  return createPortal(
    <div id="file-content" hidden>
      {project.components?.map((file, i) => {
        if (["csv", "txt"].includes(file.extension)) {
          return (
            <div id={`${file.name}.${file.extension}`} key={i}>
              {file.content}
            </div>
          );
        }
        return null;
      })}
    </div>,
    hostElement,
  );
};

export default ExternalFiles;
