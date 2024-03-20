import {
  addProjectComponent,
  updateProjectComponent,
} from "../redux/EditorSlice";

export const downloadMicroPython = async () => {
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
  if (!port || !writer) {
    const missingResource = !port ? "Port" : "Writer";
    throw new Error(`${missingResource} is missing`);
  }
  console.log("Running on Pico");
  const codeString = project.components[0].content;
  const codeLines = codeString.split(/\r?\n|\r|\n/g);
  let completeCode = "";
  for (let i = 0; i < codeLines.length; i++) {
    completeCode += `${codeLines[i]}\r`;
  }
  await writer.write(encodeText(`${completeCode}\r`));
  await readFromPico();
};

export const writeAllFilesToPico = async (port, writer, project) => {
  if (port && writer) {
    // for (let i = 0; i < project.components.length; i++) {
    for (const component of project.components) {
      await writeFileToPico(port, writer, component);
    }
    return "Done";
  }
  return "Not done";
};

export const writeFileToPico = async (port, writer, component) => {
  const encoder = new TextEncoder();
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
  await readFromPico(port);
};
// readFromPico() and readPort() need to make sure that the reader is available (not locked) - before trying to obtain reader
export const readFromPico = async (port, dispatch) => {
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
      try {
        await reader.releaseLock();
      } catch (error) {
        console.log(error);
      }
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

export const readAllFilesFromPico = async (port, writer, project, dispatch) => {
  const encoder = new TextEncoder();
  let files = [];
  if (port && writer) {
    // for (let i = 0; i < project.components.length; i++) {
    // // const fileListString = `import os\rfiles = os.listdir()\rprint(files)\r\n`;
    // // await writer.write(encoder.encode(fileListString));
    // // const fileList = await readFromPico();
    // console.log(fileList);
    const fileListString = `import ujson\rimport os\rfiles = os.listdir('/')\r`;
    await writer.write(encoder.encode(fileListString));
    const fileReadString = `for filename in files:\r    with open(filename, 'r') as file:\r        contents = file.read()\r        data = {\r            "name": filename,\r            "contents": contents\r        }\r        print(ujson.dumps(data))\r\r`;
    await writer.write(encoder.encode(fileReadString));
    const fileStream = await readFromPico(port);
    fileStream.forEach((file) => {
      if (file.includes("name") && file.includes("contents")) {
        try {
          // Is there a better way that doesn't use regex??!!
          const regex = /{([^}]*)}/;
          const rawFile = file.match(regex);

          const jsonFile = JSON.parse(rawFile[0].toString());
          console.log(jsonFile);
          files.push(jsonFile);
        } catch (error) {
          console.log(error);
        }
      }
    });
  }

  console.log("Files");
  console.log(files);
  updateProject(files, project, dispatch);
};

const updateProject = (files, project, dispatch) => {
  files.forEach((file) => {
    let fileExists = false;
    const filename = file.name.replace(/\.py$/, "");

    project.components.forEach((component) => {
      if (component.name === filename) {
        fileExists = true;
      }
    });

    if (!fileExists) {
      dispatch(addProjectComponent({ extension: "py", name: filename }));
    }

    dispatch(
      updateProjectComponent({
        extension: "py",
        name: filename,
        code: file.contents,
      })
    );
  });
};

export const disconnectFromPico = async (port, writer) => {
  if (port && writer) {
    console.log(`Disconnecting ${writer}`);
    await writer.releaseLock();
    console.log(`Disconnecting ${port}`);
    await port.close();
    console.log(`Disconnected ${port}`);
  }
};

export const connectToPico = async (setPort, setWriter) => {
  const obtainedPort = await navigator.serial.requestPort();
  await obtainedPort.open({ baudRate: 115200 }); // this is the Pico Baud Rate?
  setPort(obtainedPort);
  const obtainedWriter = obtainedPort.writable.getWriter();
  setWriter(obtainedWriter);
};

export const encodeText = (text) => {
  return new TextEncoder().encode(text);
};
