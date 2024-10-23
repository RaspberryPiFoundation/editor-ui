import React from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import NewProjectModal from "./NewProjectModal";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ApiCallHandler from "../../utils/apiCallHandler";
import {
  defaultHtmlProject,
  defaultPythonProject,
} from "../../utils/defaultProjects";

const { createOrUpdateProject } = ApiCallHandler({
  reactAppApiEndpoint: "TODO",
});
const mockNavigate = jest.fn();

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useParams: jest.fn(),
  useNavigate: () => mockNavigate,
  useLocation: jest.fn(),
}));

jest.mock("../../utils/apiCallHandler");

let store;
let inputBox;
let pythonOption;
let htmlOption;
let saveButton;

beforeEach(() => {
  createOrUpdateProject.mockImplementationOnce(() =>
    Promise.resolve({
      status: 200,
      data: { identifier: "my-amazing-project" },
    }),
  );
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      project: {
        components: [
          {
            name: "main",
            extension: "py",
          },
        ],
        project_type: "python",
      },
      nameError: "",
      newProjectModalShowing: true,
    },
    auth: {
      user: {
        access_token: "my_token",
      },
    },
  };
  store = mockStore(initialState);
  render(
    <Provider store={store}>
      <MemoryRouter>
        <div id="app">
          <NewProjectModal />
        </div>
      </MemoryRouter>
    </Provider>,
  );
  inputBox = screen.getByRole("textbox");
  pythonOption = screen.getByText("projectTypes.python");
  htmlOption = screen.getByText("projectTypes.html");
  saveButton = screen.getByText("newProjectModal.createProject");
});

test("Renders", () => {
  expect(screen.queryByText("newProjectModal.heading")).toBeInTheDocument();
});

test("Creates python project correctly", async () => {
  fireEvent.change(inputBox, { target: { value: "My amazing project" } });
  fireEvent.click(pythonOption);
  await waitFor(() => fireEvent.click(saveButton));
  expect(createOrUpdateProject).toHaveBeenCalledWith(
    { ...defaultPythonProject, name: "My amazing project" },
    "my_token",
  );
});

test("Creates HTML project correctly", async () => {
  fireEvent.change(inputBox, { target: { value: "My amazing project" } });
  fireEvent.click(htmlOption);
  await waitFor(() => fireEvent.click(saveButton));
  expect(createOrUpdateProject).toHaveBeenCalledWith(
    { ...defaultHtmlProject, name: "My amazing project" },
    "my_token",
  );
});

test("Pressing Enter creates new project", async () => {
  fireEvent.change(inputBox, { target: { value: "My amazing project" } });
  fireEvent.click(htmlOption);
  const modal = screen.getByRole("dialog");
  await waitFor(() => fireEvent.keyDown(modal, { key: "Enter" }));
  expect(createOrUpdateProject).toHaveBeenCalledWith(
    { ...defaultHtmlProject, name: "My amazing project" },
    "my_token",
  );
});

test("Navigates to new project", async () => {
  fireEvent.change(inputBox, { target: { value: "My amazing project" } });
  fireEvent.click(pythonOption);
  await waitFor(() => fireEvent.click(saveButton));
  expect(mockNavigate).toHaveBeenCalledWith(
    "/ja-JP/projects/my-amazing-project",
  );
});
