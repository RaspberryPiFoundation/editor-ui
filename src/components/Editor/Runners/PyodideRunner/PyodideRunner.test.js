import { render, screen } from "@testing-library/react";
import configureStore from "redux-mock-store";

import PyodideRunner from "./PyodideRunner";
import { Provider } from "react-redux";
import { postMessage } from "./PyodideWorker.mock.js";

beforeEach(() => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      project: {
        components: [
          { name: "main", extension: "py", content: "print('hello')" },
        ],
        image_list: [],
      },
      codeRunTriggered: true,
    },
    auth: {},
  };
  const store = mockStore(initialState);
  render(
    <Provider store={store}>
      <PyodideRunner />,
    </Provider>,
  );
});

test("it renders", () => {
  expect(screen.queryByText("output.textOutput")).toBeInTheDocument();
});

test("it sends a message to the worker to run the python code", () => {
  expect(postMessage).toHaveBeenCalledWith({
    method: "runPython",
    python: "print('hello')",
  });
});
