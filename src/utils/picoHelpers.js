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

// runOnPico currenly runs only the first project in components collection (ie Main.py))
export const runOnPico = async (port, writer, project) => {
  if (port && writer) {
    console.log("Running on Pico");
    const codeString = project.components[0].content;
    const codeLines = codeString.split(/\r?\n|\r|\n/g);
    let completeCode = "";
    for (let i = 0; i < codeLines.length; i++) {
      completeCode += `${codeLines[i]}\r`;
    }
    await writer.write(new TextEncoder().encode(`${completeCode}\r`));
    await readFromPico();
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
    await readFromPico(port);
  };

  if (port && writer) {
    // for (let i = 0; i < project.components.length; i++) {
    for (const component of project.components) {
      await writeFile(component);
    }
  }
};

// readFromPico() and readPort() need to make sure that the reader is available (not locked) - before trying to obtain reader
export const readFromPico = async (port) => {
  console.log("Reading from Pico");
  const readPort = async () => {
    const reader = port.readable.getReader();
    const decoder = new TextDecoder();
    let resultString = "";
    let resultStream = [];
    try {
      while (true) {
        const { value, done } = await Promise.race([
          reader.read(),
          new Promise((resolve, reject) => {
            setTimeout(() => resolve({ value: { timeout: true } }), 2000); // 5 seconds timeout
          }),
        ]);
        if (done || value.timeout) {
          break;
        }
        resultString += decoder.decode(value);
        // Need a more accurate marker than \n as multi-line strings form file contents
        if (resultString.includes("\n")) {
          resultStream.push(resultString);
          resultString = "";
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      console.log("Done reading");
      await reader.releaseLock();
      console.log("returning resultStream");
      return resultStream;
    }
  };
  if (port) {
    try {
      const resultStream = await readPort();
      return resultStream;
    } catch (error) {
      console.log(error);
    }
  }
};
