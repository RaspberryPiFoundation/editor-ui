export default class MicroPython {
  async configurePort(port) {
    this.port = port;
    console.log(this, port);
    await this.getReader();
    await this.getWriter();
    console.log("Port configured");
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

  async getWriter() {
    try {
      this.writer = await this.port.writable.getWriter();
      console.log("We have a writer here");
      console.log(this.writer);
    } catch (error) {
      console.log(error);
    }
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
