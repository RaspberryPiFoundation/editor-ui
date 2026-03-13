import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import UploadButton from "./UploadButton";
import { postMessageToScratchIframe } from "../../utils/scratchIframe";

jest.mock("../../utils/scratchIframe");

const createStore = (project) =>
  configureStore({
    reducer: {
      editor: () => ({ project }),
    },
  });

const renderUploadButton = (project) => {
  postMessageToScratchIframe.mockClear();
  const store = createStore(project);
  render(
    <Provider store={store}>
      <UploadButton buttonText="Upload" Icon={() => null} />
    </Provider>,
  );
  return screen.getByTestId("upload-file-input");
};

describe("UploadButton", () => {
  describe("when project is Scratch", () => {
    let fileInput;

    beforeEach(() => {
      fileInput = renderUploadButton({
        project_type: "code_editor_scratch",
        name: "Cool Scratch",
      });
    });

    test("clicking the button triggers the file input", () => {
      const button = screen.getByRole("button", { name: "Upload" });
      const clickSpy = jest.spyOn(fileInput, "click");
      fireEvent.click(button);
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    test("selecting a file sends scratch-gui-upload message with the file", () => {
      const file = new File(["content"], "project.sb3", {
        type: "application/octet-stream",
      });
      fireEvent.change(fileInput, { target: { files: [file] } });
      expect(postMessageToScratchIframe).toHaveBeenCalledTimes(1);
      expect(postMessageToScratchIframe).toHaveBeenCalledWith({
        type: "scratch-gui-upload",
        file,
      });
    });
  });

  describe("when project is not Scratch", () => {
    let fileInput;

    beforeEach(() => {
      fileInput = renderUploadButton({
        project_type: "code_editor_python",
        name: "My Python Project",
      });
    });

    test("selecting a file does not call postMessageToScratchIframe", () => {
      const file = new File(["content"], "project.sb3", {
        type: "application/octet-stream",
      });
      fireEvent.change(fileInput, { target: { files: [file] } });
      expect(postMessageToScratchIframe).not.toHaveBeenCalled();
    });
  });
});
