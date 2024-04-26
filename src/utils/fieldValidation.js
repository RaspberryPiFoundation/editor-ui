export const fieldError = ({ errorFields, fieldName, errorMessage }) => {
  return errorFields.some((field) => field === fieldName) && errorMessage;
};

export const existsValidation = ({ stepData, fieldName }) => {
  if (!stepData[fieldName]) return fieldName;

  return false;
};

export const urlValidation = ({ stepData, fieldName }) => {
  if (!stepData[fieldName]) return fieldName;
  if (!stepData[fieldName].match(/[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+/))
    return fieldName;

  return false;
};
