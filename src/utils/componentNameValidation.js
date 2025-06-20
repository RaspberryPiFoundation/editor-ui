import { setNameError } from "../redux/EditorSlice";
import { allowedExtensionsString } from "./allowedExtensionsString";

const allowedExtensions = {
  python: ["py", "csv", "txt"],
  html: ["html", "css", "js"],
};

const reservedFileNames = ["INSTRUCTIONS.md"];

const isValidFileName = (fileName, projectType, componentNames) => {
  const extension = fileName.split(".").slice(1).join(".");
  if (
    !reservedFileNames.includes(fileName) &&
    allowedExtensions[projectType].includes(extension) &&
    !componentNames.includes(fileName) &&
    fileName.split(" ").length === 1
  ) {
    return true;
  } else {
    return false;
  }
};

export const validateFileName = (
  fileName,
  projectType = "python",
  componentNames,
  dispatch,
  t,
  callback,
  currentFileName = null,
) => {
  const extension = fileName.split(".").slice(1).join(".");
  if (
    isValidFileName(fileName, projectType, componentNames) ||
    (currentFileName && fileName === currentFileName)
  ) {
    callback();
  } else if (reservedFileNames.includes(fileName)) {
    dispatch(
      setNameError(t("filePanel.errors.reservedFileName", { fileName })),
    );
  } else if (componentNames.includes(fileName)) {
    dispatch(setNameError(t("filePanel.errors.notUnique")));
  } else if (fileName.split(" ").length > 1) {
    dispatch(setNameError(t("filePanel.errors.containsSpaces")));
  } else if (!allowedExtensions[projectType].includes(extension)) {
    dispatch(
      setNameError(
        t("filePanel.errors.unsupportedExtension", {
          allowedExtensions: allowedExtensionsString(
            projectType,
            t,
            allowedExtensions,
          ),
        }),
      ),
    );
  } else {
    dispatch(setNameError(t("filePanel.errors.generalError")));
  }
};
