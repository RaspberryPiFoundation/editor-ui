import React from "react";
import EmbeddedViewer from "./EmbeddedViewer";

import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useProject } from "../Editor/Hooks/useProject";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    identifier: "my-amazing-project",
  }),
}));

jest.mock("../Editor/Hooks/useProject", () => ({
  useProject: jest.fn(),
}));

let store;
let asFragment;

beforeEach(() => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);

  const initialState = {
    editor: {
      loading: "success",
      project: {
        components: [],
      },
    },
    auth: {
      user: {
        access_token: "my_token",
      },
    },
  };
  store = mockStore(initialState);
  ({ asFragment } = render(
    <Provider store={store}>
      <MemoryRouter>
        <EmbeddedViewer />
      </MemoryRouter>
    </Provider>,
  ));
});

test("Renders without crashing", () => {
  expect(asFragment()).toMatchSnapshot();
});

test("Loads project with correct params", () => {
  expect(useProject).toHaveBeenCalledWith({
    projectIdentifier: "my-amazing-project",
    accessToken: "my_token",
    isEmbedded: true,
  });
});
