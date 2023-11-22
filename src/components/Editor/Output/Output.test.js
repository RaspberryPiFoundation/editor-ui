import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import Output from "./Output";
import { MemoryRouter } from "react-router-dom";

let mockBrowserPreview = "false";

jest
  .spyOn(URLSearchParams.prototype, "get")
  .mockImplementation((key) =>
    key === "browserPreview" ? mockBrowserPreview : null,
  );

const user = {
  access_token: "39a09671-be55-4847-baf5-8919a0c24a25",
  profile: {
    user: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf",
  },
};

test("Component renders", () => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      project: {
        components: [],
      },
    },
    auth: {
      user,
    },
  };
  const store = mockStore(initialState);
  const { container } = render(
    <Provider store={store}>
      <MemoryRouter>
        <Output />
      </MemoryRouter>
    </Provider>,
  );
  expect(container.lastChild).toHaveClass("proj-runner-container");
});

describe("When embedded", () => {
  let store;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [],
        },
        isEmbedded: true,
      },
      auth: {
        user,
      },
    };
    store = mockStore(initialState);
  });

  test("Shows run bar when not browser preview", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Output />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.queryByText("runButton.run")).toBeInTheDocument();
  });

  // TODO: Get this test working
  // test("Does not show run bar when browser preview", () => {
  //   mockBrowserPreview = "true";
  //   render(
  //     <Provider store={store}>
  //       <MemoryRouter>
  //         <Output />
  //       </MemoryRouter>
  //     </Provider>,
  //   );
  //   expect(screen.queryByText("runButton.run")).not.toBeInTheDocument();
  // });
});
