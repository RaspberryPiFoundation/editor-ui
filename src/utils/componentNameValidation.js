import { setNameError } from "../components/Editor/EditorSlice";

const allowedExtensions = {
  "python": [
    "py",
    "csv",
    "txt"
  ]
}

const allowedExtensionsString = (projectType, t) => {
  const extensionsList = allowedExtensions[projectType];
  if (extensionsList.length === 1) {
    return `'.${extensionsList[0]}'`
  } else {
    return `'.${extensionsList.slice(0,-1).join(`', '.`)}' ${t('filePane.errors.or')} '.${extensionsList[extensionsList.length-1]}'`;
  }
}

const isValidFileName = (fileName, projectType, componentNames) => {
  const extension = fileName.split('.').slice(1).join('.')
  if (allowedExtensions[projectType].includes(extension) && !componentNames.includes(fileName) && fileName.split(' ').length == 1) {
    return true;
  } else {
    return false;
  }
}

export const validateFileName = (fileName, projectType="python", componentNames, dispatch, t, callback, currentFileName=null) => {
  const extension = fileName.split('.').slice(1).join('.');
  if (isValidFileName(fileName, projectType, componentNames) || (currentFileName && fileName === currentFileName)) {
    callback()
  } else if (componentNames.includes(fileName)) {
    dispatch(setNameError(t('filePane.errors.notUnique')));
  } else if (fileName.split(' ').length > 1) {
    dispatch(setNameError(t('filePane.errors.containsSpaces')))
  } else if (!allowedExtensions[projectType].includes(extension)) {
    dispatch(setNameError(t('filePane.errors.unsupportedExtension', {allowedExtensions: allowedExtensionsString(projectType, t)})));
  } else {
    dispatch(setNameError(t('filePane.errors.generalError')));
  }
}


