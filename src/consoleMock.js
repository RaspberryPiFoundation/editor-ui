const originalError = console.error;
const originalWarn = console.warn;

window.console.warn = (msg) => {
  if (msg.includes("DEPRECATED: icons as React elements will not be supported in future releases") ||
      msg.includes("PyodideWorker is not initialized") ||
      msg.includes("changing the droppableId")) {
    return;
  }

  originalWarn(msg);
}

window.console.error = (error) => {
  let msg;
  if (typeof(error) === "object") {
    msg = error.message;
  } else {
    msg = error;
  }

  if (msg.includes("inside a test was not wrapped in act(...)") ||
      msg.includes("Warning: Invalid value for prop") ||
      msg.includes("getClientRects is not a function") ||
      msg.includes("An error occurred! For more details, see the full error text at") ||
      msg.includes("Warning: react-modal: App element is not defined") ||
      msg.includes("Support for defaultProps will be removed from function components") ||
      msg.includes("A component is changing a controlled input to be uncontrolled") ||
      msg.includes("Unsupported origin: unsupported") ||
      msg.includes("Consider adding an error boundary to your tree") ||
      msg.includes("Each child in a list should have a unique")) {
    return;
  }

  originalError(error);
}
