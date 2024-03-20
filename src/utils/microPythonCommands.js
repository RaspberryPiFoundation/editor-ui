export const openFile = (fileName) => {
  return `with open('${fileName}.py', 'w') as file:`;
};

export const writeToFile = (code) => {
  return `    file.write('${code}\\n')`;
};


