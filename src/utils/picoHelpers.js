import {
  addProjectComponent,
  updateProjectComponent,
  stopCodeRun,
  setPicoOutput,
} from "../redux/EditorSlice";

import * as microPythonCommands from "./microPythonCommands";

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
export const runOnPico = async (port, project, dispatch) => {
  if (!port) {
    throw new Error("Port is missing");
  }
  const writer = port.writable.getWriter();
  console.log("Writer");
  console.log(writer);
  const codeString = project.components[0].content;
  const codeLines = codeString.split(/\r?\n|\r|\n/g);
  let completeCode = "";
  for (let i = 0; i < codeLines.length; i++) {
    completeCode += `${codeLines[i]}\r`;
  }
  await writer.write(encodeText(`${completeCode}\r`));
  console.log("writer released");
  await writer.releaseLock();
  await readFromPico(port, dispatch);
};

export const writeAllFilesToPico = async (port, project, dispatch) => {
  if (!port) {
    return;
  }
  const writer = await port.writable.getWriter();
  if (!port) {
    const missingResource = !port ? "Port" : "Writer";
    throw new Error(`${missingResource} is missing`);
  }
  // for (let i = 0; i < project.components.length; i++) {
  for (const component of project.components) {
    await writeFileToPico(port, writer, component);
    console.log(`${component.name} written to Pico`);
  }
  await writer.releaseLock();
  dispatch(stopCodeRun());
  console.log("Files written to Pico");
};

export const writeFileToPico = async (port, writer, component) => {
  if (!port) {
    return;
  }
  if (!writer) {
    throw new Error("Writer is missing");
    return;
  }
  const encoder = new TextEncoder();
  const codeString = component.content;
  const codeLines = codeString.split(/\r?\n|\r|\n/g);
  await writer.write(
    encoder.encode(microPythonCommands.openFile(component.name))
  );
  await writer.write(encoder.encode("\r"));
  for (let i = 0; i < codeLines.length; i++) {
    const line = microPythonCommands.writeToFile(codeLines[i]);
    await writer.write(encoder.encode(line));
    await writer.write(encoder.encode("\r"));
  }
  await writer.write(encoder.encode("\r"));
};
// readFromPico() and readPort() need to make sure that the reader is available (not locked) - before trying to obtain reader
export const readFromPico = async (port, dispatch) => {
  const readPort = async () => {
    const reader = port.readable.getReader();
    const decoder = new TextDecoder();
    let resultStream = [];
    let resultString = "";
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
        if (resultString.includes("\n")) {
          resultStream.push(resultString);
          resultString = "";
        }
        dispatch(setPicoOutput(resultString));
      }
    } catch (error) {
      console.log(error);
    } finally {
      console.log("Done reading");
      console.log(resultString);
      try {
        await reader.releaseLock();
      } catch (error) {
        console.log(error);
      }
      console.log("returning resultStream");
      console.log(resultString.split("{"));
      dispatch(stopCodeRun());
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

export const readAllFilesFromPico = async (port, project, dispatch) => {
  if (!port) {
    return;
  }
  const writer = await port.writable.getWriter();
  const encoder = new TextEncoder();
  let files = [];
  if (port && writer) {
    const listFilesCommand = `import ujson\rimport os\rfiles = os.listdir('/')\r`;
    await writer.write(encoder.encode(listFilesCommand));
    const readFilesCommand = `for filename in files:\r    with open(filename, 'r') as file:\r        contents = file.read()\r        data = {\r            "name": filename,\r            "contents": contents\r        }\r        print(ujson.dumps(data))\r\r`;
    await writer.write(encoder.encode(readFilesCommand));
    const fileStream = await readFromPico(port, dispatch);
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
  await writer.releaseLock();
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

export const stopPico = async (port) => {
  if (!port) {
    return;
  }
  const encoder = new TextEncoder();

  const writableStream = port.writable;

  const writer = writableStream.getWriter();

  const ctrlC = String.fromCharCode(0x03);
  await writer.write(encoder.encode(ctrlC));
  writer.releaseLock();
};

export const encodeText = (text) => {
  return new TextEncoder().encode(text);
};
