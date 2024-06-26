export default class MicroPython {
  async configurePort(port) {
    this.port = port;
    console.log(this, port);
    await this.getReader();
    await this.getWriter();
  }

  async getReader() {
    try {
      this.reader = await this.port.readable.getReader();
      console.log("We have a reader here");
      console.log(this.reader);
    } catch (error) {
      console.log(error);
    }
  }

  async releaseReader() {
    try {
      await this.reader.releaseLock();
    } catch (error) {
      console.log(error);
    }
  }

  async getWriter() {
    try {
      this.writer = await this.port.writable.getWriter();
      console.log("We have a writer here");
      console.log(this.writer);
    } catch (error) {
      console.log(error);
    }
  }

  async releaseWriter() {
    try {
      await this.writer.releaseLock();
    } catch (error) {
      console.log(error);
    }
  }

  async closePort() {
    await this.releaseReader();
    await this.releaseWriter();
    try {
      await this.port.close();
    } catch (error) {
      console.log(error);
    }
  }

  async runCode(code) {
    const formattedCode = this.formatCode(code);
    try {
      console.log("Sending code to pico");
      await this.writer.write(this.encodeText(`${formattedCode}\r`));
    } catch (error) {
      console.log(error);
    }
  }

  // helpers
  encodeText(text) {
    return new TextEncoder().encode(text);
  }

  formatCode(code) {
    const codeLines = code.split(/\r?\n|\r|\n/g);
    let completeCode = "";
    for (let i = 0; i < codeLines.length; i++) {
      completeCode += `${codeLines[i]}\r`;
    }
    return completeCode;
  }
}

// const getReader = async () => {
//   if (!port) {
//     return;
//   }
//   try {
//     const reader = await port.readable.getReader();
//     return reader;
//   } catch (error) {
//     console.log(error);
//   }
// };

// const releaseReader = async (reader) => {
//   if (reader && reader.locked) {
//     try {
//       await reader.releaseLock();

//     } catch (error) {
//       console.log(error);
//     }
//   }
// };

// helpers
