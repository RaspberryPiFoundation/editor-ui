export const postMessage = jest.fn((...args) => {
  console.log("Received postMessage with", args);
});

class PyodideWorker {
  constructor() {
    this.postMessage = postMessage;
    this.terminate = jest.fn();
    this.onmessage = null;
    PyodideWorker.lastInstance = this;
  }

  postMessageFromWorker(message) {
    if (this.onmessage) {
      this.onmessage({ data: message });
    }
  }

  static getLastInstance() {
    return PyodideWorker.lastInstance;
  }
}

export default PyodideWorker;
