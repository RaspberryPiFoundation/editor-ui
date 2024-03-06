export const downloadMicroPython = async () => {
  console.log("Installing!!");
  try {
    const fileUrl =
      "https://micropython.org/download/rp2-pico/rp2-pico-latest.uf2";

    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = "rp2-pico-latest.uf2";
    document.body.appendChild(link);
    link.click();
    return "Success";
  } catch (error) {
    return error;
  }
};

export const writeAllFilesToPico = async (port, writer, project) => {
  const encoder = new TextEncoder();
  const writeFile = async (component) => {
    console.log(`Writing ${component.name} to Pico`);
    const fileWriteString = `with open('${component.name}.py', 'w') as file:`;
    const codeString = component.content;
    const codeLines = codeString.split(/\r?\n|\r|\n/g);
    await writer.write(encoder.encode(fileWriteString));
    await writer.write(encoder.encode("\r"));
    for (let i = 0; i < codeLines.length; i++) {
      const line = `    file.write('${codeLines[i]}\\n')`;
      await writer.write(encoder.encode(line));
      await writer.write(encoder.encode("\r"));
    }
    await writer.write(encoder.encode("\r"));
    console.log("Done writing!");
    //   await readFromPico();
  };

  if (port && writer) {
    // for (let i = 0; i < project.components.length; i++) {
    for (const component of project.components) {
      await writeFile(component);
    }
  }
};
