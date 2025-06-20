export const allowedExtensionsString = (projectType, t, allowedExtensions) => {
  const extensionsList = allowedExtensions[projectType];
  if (extensionsList.length === 1) {
    return `'.${extensionsList[0]}'`;
  } else {
    return `'.${extensionsList.slice(0, -1).join(`', '.`)}' ${t(
      "common.or",
    )} '.${extensionsList[extensionsList.length - 1]}'`;
  }
};
