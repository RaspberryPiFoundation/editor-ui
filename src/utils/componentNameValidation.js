import { setNameError } from "../components/Editor/EditorSlice";

const allowedExtensions = {
  "python": [
    "py",
    "csv",
    "txt"
  ]
}

const allowedExtensionsString = (projectType) => {
  const extensionsList = allowedExtensions[projectType];
  if (extensionsList.length === 1) {
    return `'.${extensionsList[0]}'`
  } else {
    return `'.` + extensionsList.slice(0,-1).join(`', '.`) + `' or '.` + extensionsList[extensionsList.length-1] + `'`;
  }
}

const isValidFileName = (fileName, projectType, componentNames) => {
  const extension = fileName.split('.').slice(1).join('.')
  if (allowedExtensions[projectType].includes(extension) && !componentNames.includes(fileName)) {
    return true;
  } else {
    return false;
  }
}

export const validateFileName = (fileName, projectType, componentNames, dispatch, callback, currentFileName=null) => {
  const extension = fileName.split('.').slice(1).join('.');
  if (isValidFileName(fileName, projectType, componentNames) || (currentFileName && fileName === currentFileName)) {
    callback()
  } else if (componentNames.includes(fileName)) {
    dispatch(setNameError("File names must be unique."));
  } else if (!allowedExtensions[projectType].includes(extension)) {
    dispatch(setNameError(`File names must end in ${allowedExtensionsString(projectType)}.`));
  } else {
    dispatch(setNameError("Error"));
  }
}


