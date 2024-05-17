import React from "react";
import { useSelector } from "react-redux";

const ExternalFiles = () => {
  const project = useSelector((state) => state.editor.project);

  return (
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
    </div>
  );
};

export default ExternalFiles;
