import React from "react";
import DefaultFileIcon from "../assets/icons/file.svg";
import PythonFileIcon from "../assets/icons/python_file.svg";
import HtmlFileIcon from "../assets/icons/html_file.svg";
import CssFileIcon from "../assets/icons/css_file.svg";
import CsvFileIcon from "../assets/icons/csv_file.svg";

const FileIcon = ({ ext }) => {
  switch (ext) {
    case "py":
      return <PythonFileIcon data-testid="pythonIcon" />;
    case "html":
      return <HtmlFileIcon data-testid="htmlIcon" />;
    case "css":
      return <CssFileIcon data-testid="cssIcon" />;
    case "csv":
      return <CsvFileIcon data-testid="csvIcon" />;
    default:
      return <DefaultFileIcon data-testid="defaultFileIcon" />;
  }
};

export default FileIcon;
