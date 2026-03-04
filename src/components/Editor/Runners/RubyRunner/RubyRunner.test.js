import { act, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";

import RubyRunner from "./RubyRunner";
import PyodideWorker, {
  postMessage,
} from "../PythonRunner/PyodideRunner/PyodideWorker.mock";
import {
  resetState,
  setProject,
  triggerCodeRun,
} from "../../../../redux/EditorSlice";
import store from "../../../../app/store";

const project = {
  components: [
    { name: "main", extension: "rb", content: "puts 'hello from ruby'" },
    {
      name: "lib/greeter",
      extension: "rb",
      content: "module Greeter; def self.hello; 'hi'; end; end",
    },
  ],
  image_list: [],
};

describe("RubyRunner", () => {
  beforeEach(() => {
    store.dispatch(resetState());
    postMessage.mockClear();

    act(() => {
      store.dispatch(setProject(project));
    });
  });

  test("it sends runRuby to the worker when run is triggered", async () => {
    render(
      <Provider store={store}>
        <RubyRunner />
      </Provider>,
    );

    act(() => {
      store.dispatch(triggerCodeRun());
    });

    await waitFor(() => {
      expect(postMessage).toHaveBeenCalledWith({
        method: "runRuby",
        files: {
          "main.rb": "puts 'hello from ruby'",
          "lib/greeter.rb": "module Greeter; def self.hello; 'hi'; end; end",
        },
        activeFile: "main.rb",
      });
    });
  });

  test("it streams output chunks from the worker", () => {
    render(
      <Provider store={store}>
        <RubyRunner />
      </Provider>,
    );

    const worker = PyodideWorker.getLastInstance();
    worker.postMessageFromWorker({
      method: "handleOutput",
      stream: "stdout",
      content: "hello\n",
    });

    expect(screen.getByText("hello", { exact: false })).toBeInTheDocument();
  });
});
