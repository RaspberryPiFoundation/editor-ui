export const postMessage = jest.fn((...args) => {
  console.log("Received postMessage with", args);
});

class PyodideWorker {
  constructor() {
    this.postMessage = postMessage;
  }
}

export default PyodideWorker;
