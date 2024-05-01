export const fieldError = ({ errors, fieldName, errorMessage }) => {
  return errors.some((field) => field === fieldName) && errorMessage;
};

export const existsValidation = ({ stepData, fieldName }) => {
  if (!stepData[fieldName]) return fieldName;

  return false;
};

export const urlValidation = ({ stepData, fieldName }) => {
  if (!stepData[fieldName]) return fieldName;
  if (
    !stepData[fieldName].match(
      /^(?:https?:\/\/)?(?:www.)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,6}(\/.*)?$/i,
    )
  ) {
    return fieldName;
  }

  return false;
};
