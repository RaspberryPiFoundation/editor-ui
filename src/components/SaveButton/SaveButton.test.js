import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { triggerSave } from "../../redux/EditorSlice";
import SaveButton from "./SaveButton";

// jest.mock("axios");

// jest.mock("react-router-dom", () => ({
//   ...jest.requireActual("react-router-dom"),
//   useNavigate: () => jest.fn(),
// }));

// jest.mock("../../redux/EditorSlice", () => ({
//   ...jest.requireActual("../../redux/EditorSlice"),
//   syncProject: jest.fn((_) => jest.fn()),
// }));

describe("When project is loaded", () => {
  let store;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        loading: "success",
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <SaveButton />
      </Provider>,
    );
  });

  test("Save button renders", () => {
    expect(screen.queryByText("header.save")).toBeInTheDocument();
  });

  test("Clicking save dispatches trigger save action", () => {
    const saveButton = screen.queryByText("header.save");
    fireEvent.click(saveButton);
    expect(store.getActions()).toEqual([triggerSave()]);
  });
});

describe("When project is not loaded", () => {
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const store = mockStore({
      editor: {},
    });
    render(
      <Provider store={store}>
        <SaveButton />
      </Provider>,
    );
  });
  test("Does not render save button", () => {
    expect(screen.queryByText("header.save")).not.toBeInTheDocument();
  });
});

// describe("When logged in and user owns project", () => {
//   let store;
//   let saveButton;

//   beforeEach(() => {
//     const middlewares = [];
//     const mockStore = configureStore(middlewares);
//     const initialState = {
//       editor: {
//         project: project,
//         loading: "success",
//       },
//       auth: {
//         user: user,
//       },
//     };
//     store = mockStore(initialState);
//     render(
//       <Provider store={store}>
//         <MemoryRouter>
//           <SaveButton />
//         </MemoryRouter>
//       </Provider>,
//     );
//     saveButton = screen.queryByText("header.save");
//   });

//   test("Clicking save dispatches saveProject with correct parameters", async () => {
//     const saveAction = { type: "SAVE_PROJECT" };
//     const saveProject = jest.fn(() => saveAction);
//     syncProject.mockImplementationOnce(jest.fn((_) => saveProject));
//     fireEvent.click(saveButton);
//     await waitFor(() =>
//       expect(saveProject).toHaveBeenCalledWith({
//         project,
//         accessToken: user.access_token,
//         autosave: false,
//       }),
//     );
//     expect(store.getActions()[0]).toEqual(saveAction);
//   });
// });

// describe("When logged in and no project identifier", () => {
//   let store;
//   const project_without_id = { ...project, identifier: null };

//   beforeEach(() => {
//     const middlewares = [];
//     const mockStore = configureStore(middlewares);
//     const initialState = {
//       editor: {
//         project: project_without_id,
//         loading: "success",
//       },
//       auth: {
//         user: user,
//       },
//     };
//     store = mockStore(initialState);
//     render(
//       <Provider store={store}>
//         <MemoryRouter>
//           <SaveButton />
//         </MemoryRouter>
//       </Provider>,
//     );
//   });

//   test("Clicking save dispatches saveProject with correct parameters", async () => {
//     const saveAction = { type: "SAVE_PROJECT" };
//     const saveProject = jest.fn(() => saveAction);
//     syncProject.mockImplementationOnce(jest.fn((_) => saveProject));
//     const saveButton = screen.getByText("header.save");
//     fireEvent.click(saveButton);
//     await waitFor(() =>
//       expect(saveProject).toHaveBeenCalledWith({
//         project: project_without_id,
//         accessToken: user.access_token,
//         autosave: false,
//       }),
//     );
//     expect(store.getActions()[0]).toEqual(saveAction);
//   });
// });

// describe("When logged in and user does not own project", () => {
//   const another_project = {
//     ...project,
//     user_id: "5254370e-26d2-4c8a-9526-8dbafea43aa9",
//   };
//   let store;

//   beforeEach(() => {
//     const middlewares = [];
//     const mockStore = configureStore(middlewares);
//     const initialState = {
//       editor: {
//         project: another_project,
//         loading: "success",
//       },
//       auth: {
//         user: user,
//       },
//     };
//     store = mockStore(initialState);
//     render(
//       <Provider store={store}>
//         <MemoryRouter>
//           <SaveButton />
//         </MemoryRouter>
//       </Provider>,
//     );
//   });

//   test("Clicking save dispatches remixProject with correct parameters", async () => {
//     const remixAction = { type: "REMIX_PROJECT" };
//     const remixProject = jest.fn(() => remixAction);
//     syncProject.mockImplementationOnce(jest.fn((_) => remixProject));
//     const saveButton = screen.getByText("header.save");
//     fireEvent.click(saveButton);
//     await waitFor(() =>
//       expect(remixProject).toHaveBeenCalledWith({
//         project: another_project,
//         accessToken: user.access_token,
//       }),
//     );
//     expect(store.getActions()[0]).toEqual(remixAction);
//   });
// });

// describe("When not logged in", () => {
//   let store;

//   beforeEach(() => {
//     const middlewares = [];
//     const mockStore = configureStore(middlewares);
//     const initialState = {
//       editor: {
//         project: project,
//         loading: "success",
//       },
//       auth: {
//         user: null,
//       },
//     };
//     store = mockStore(initialState);
//     render(
//       <Provider store={store}>
//         <MemoryRouter>
//           <SaveButton />
//         </MemoryRouter>
//       </Provider>,
//     );
//   });

//   test("Clicking save opens login to save modal", () => {
//     const saveButton = screen.getByText("header.save");
//     fireEvent.click(saveButton);
//     expect(store.getActions()).toEqual([showLoginToSaveModal()]);
//   });
// });

// describe("When no project loaded", () => {
//   beforeEach(() => {
//     const middlewares = [];
//     const mockStore = configureStore(middlewares);
//     const initialState = {
//       editor: {
//         project: {},
//         loading: "idle",
//       },
//       auth: {
//         user: user,
//       },
//     };
//     const store = mockStore(initialState);
//     render(
//       <Provider store={store}>
//         <MemoryRouter>
//           <SaveButton />
//         </MemoryRouter>
//       </Provider>,
//     );
//   });

//   test("No save button", () => {
//     expect(screen.queryByText("header.save")).not.toBeInTheDocument();
//   });
// });
