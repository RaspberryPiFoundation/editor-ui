// describe("When not logged in and just loaded", () => {
//   let mockedStore;

//   beforeEach(() => {
//     const middlewares = [];
//     const mockStore = configureStore(middlewares);
//     const initialState = {
//       editor: {
//         project,
//         loading: "success",
//         justLoaded: true,
//         openFiles: [[]],
//         focussedFileIndices: [0],
//       },
//       auth: {},
//     };
//     mockedStore = mockStore(initialState);
//     render(
//       <Provider store={mockedStore}>
//         <MemoryRouter>
//           <div id="app">
//             <ProjectComponentLoader match={{ params: {} }} />
//           </div>
//         </MemoryRouter>
//       </Provider>,
//     );
//   });

//   afterEach(() => {
//     localStorage.clear();
//   });

//   test("Expires justLoaded", async () => {
//     const expectedActions = [
//       setProject(defaultPythonProject),
//       expireJustLoaded(),
//     ];
//     await waitFor(
//       () => expect(mockedStore.getActions()).toEqual(expectedActions),
//       { timeout: 2100 },
//     );
//   });
// });

// describe("When not logged in and not just loaded", () => {
//   let mockedStore;
//   let expectedActions;

//   beforeEach(() => {
//     const middlewares = [];
//     const mockStore = configureStore(middlewares);
//     const initialState = {
//       editor: {
//         project,
//         loading: "success",
//         justLoaded: false,
//         openFiles: [[]],
//         focussedFileIndices: [0],
//       },
//       auth: {},
//     };
//     mockedStore = mockStore(initialState);
//     render(
//       <Provider store={mockedStore}>
//         <MemoryRouter>
//           <div id="app">
//             <ProjectComponentLoader match={{ params: {} }} />
//           </div>
//         </MemoryRouter>
//       </Provider>,
//     );
//     expectedActions = [setProject(defaultPythonProject)];
//   });

//   afterEach(() => {
//     localStorage.clear();
//   });

//   test("Login prompt shown", async () => {
//     await waitFor(() => expect(showLoginPrompt).toHaveBeenCalled(), {
//       timeout: 2100,
//     });
//   });

//   test("Dispatches save prompt shown action", async () => {
//     expectedActions.push(setHasShownSavePrompt());
//     await waitFor(
//       () => expect(mockedStore.getActions()).toEqual(expectedActions),
//       { timeout: 2100 },
//     );
//   });

//   test("Project saved in localStorage", async () => {
//     await waitFor(
//       () =>
//         expect(localStorage.getItem("hello-world-project")).toEqual(
//           JSON.stringify(project),
//         ),
//       { timeout: 2100 },
//     );
//   });
// });

// describe("When not logged in and has been prompted to login to save", () => {
//   let mockedStore;

//   beforeEach(() => {
//     const middlewares = [];
//     const mockStore = configureStore(middlewares);
//     const initialState = {
//       editor: {
//         project,
//         loading: "success",
//         justLoaded: false,
//         hasShownSavePrompt: true,
//         openFiles: [[]],
//         focussedFileIndices: [0],
//       },
//       auth: {},
//     };
//     mockedStore = mockStore(initialState);
//     render(
//       <Provider store={mockedStore}>
//         <MemoryRouter>
//           <div id="app">
//             <ProjectComponentLoader match={{ params: {} }} />
//           </div>
//         </MemoryRouter>
//       </Provider>,
//     );
//   });

//   afterEach(() => {
//     localStorage.clear();
//   });

//   test("Login prompt shown", async () => {
//     jest.runAllTimers();
//     await waitFor(() => expect(showLoginPrompt).not.toHaveBeenCalled(), {
//       timeout: 2100,
//     });
//   });

//   test("Project saved in localStorage", async () => {
//     await waitFor(
//       () =>
//         expect(localStorage.getItem("hello-world-project")).toEqual(
//           JSON.stringify(project),
//         ),
//       { timeout: 2100 },
//     );
//   });
// });

// describe("When logged in and user does not own project and just loaded", () => {
//   let mockedStore;
//   let expectedActions;

//   beforeEach(() => {
//     const middlewares = [];
//     const mockStore = configureStore(middlewares);
//     const initialState = {
//       editor: {
//         project,
//         loading: "success",
//         justLoaded: true,
//         openFiles: [[]],
//         focussedFileIndices: [0],
//       },
//       auth: {
//         user: user2,
//       },
//     };
//     mockedStore = mockStore(initialState);
//     render(
//       <Provider store={mockedStore}>
//         <MemoryRouter>
//           <div id="app">
//             <ProjectComponentLoader match={{ params: {} }} />
//           </div>
//         </MemoryRouter>
//       </Provider>,
//     );
//     expectedActions = [setProject(defaultPythonProject)];
//   });

//   afterEach(() => {
//     localStorage.clear();
//   });

//   test("Expires justLoaded", async () => {
//     expectedActions.push(expireJustLoaded());
//     await waitFor(
//       () => expect(mockedStore.getActions()).toEqual(expectedActions),
//       { timeout: 2100 },
//     );
//   });
// });

// describe("When logged in and user does not own project and not just loaded", () => {
//   let mockedStore;
//   let expectedActions;

//   beforeEach(() => {
//     const middlewares = [];
//     const mockStore = configureStore(middlewares);
//     const initialState = {
//       editor: {
//         project,
//         loading: "success",
//         justLoaded: false,
//         openFiles: [[]],
//         focussedFileIndices: [0],
//       },
//       auth: {
//         user: user2,
//       },
//     };
//     mockedStore = mockStore(initialState);
//     render(
//       <Provider store={mockedStore}>
//         <MemoryRouter>
//           <div id="app">
//             <ProjectComponentLoader match={{ params: {} }} />
//           </div>
//         </MemoryRouter>
//       </Provider>,
//     );
//     expectedActions = [setProject(defaultPythonProject)];
//   });

//   afterEach(() => {
//     localStorage.clear();
//   });

//   test("Save prompt shown", async () => {
//     await waitFor(() => expect(showSavePrompt).toHaveBeenCalled(), {
//       timeout: 2100,
//     });
//   });

//   test("Dispatches save prompt shown action", async () => {
//     expectedActions.push(setHasShownSavePrompt());
//     await waitFor(
//       () => expect(mockedStore.getActions()).toEqual(expectedActions),
//       { timeout: 2100 },
//     );
//   });

//   test("Project saved in localStorage", async () => {
//     await waitFor(
//       () =>
//         expect(localStorage.getItem("hello-world-project")).toEqual(
//           JSON.stringify(project),
//         ),
//       { timeout: 2100 },
//     );
//   });
// });

// describe("When logged in and user does not own project and prompted to save", () => {
//   let mockedStore;

//   beforeEach(() => {
//     const middlewares = [];
//     const mockStore = configureStore(middlewares);
//     const initialState = {
//       editor: {
//         project,
//         loading: "success",
//         justLoaded: false,
//         hasShownSavePrompt: true,
//         openFiles: [[]],
//         focussedFileIndices: [0],
//       },
//       auth: {
//         user: user2,
//       },
//     };
//     mockedStore = mockStore(initialState);
//     render(
//       <Provider store={mockedStore}>
//         <MemoryRouter>
//           <div id="app">
//             <ProjectComponentLoader match={{ params: {} }} />
//           </div>
//         </MemoryRouter>
//       </Provider>,
//     );
//   });

//   afterEach(() => {
//     localStorage.clear();
//   });

//   test("Save prompt not shown again", async () => {
//     jest.runAllTimers();
//     await waitFor(() => expect(showSavePrompt).not.toHaveBeenCalled(), {
//       timeout: 2100,
//     });
//   });

//   test("Project saved in localStorage", async () => {
//     await waitFor(
//       () =>
//         expect(localStorage.getItem("hello-world-project")).toEqual(
//           JSON.stringify(project),
//         ),
//       { timeout: 2100 },
//     );
//   });
// });

// describe("When logged in and user does not own project and awaiting save", () => {
//   let mockedStore;
//   let remixProject;
//   let remixAction;
//   let expectedActions;

//   beforeEach(() => {
//     const middlewares = [];
//     const mockStore = configureStore(middlewares);
//     const initialState = {
//       editor: {
//         project,
//         loading: "success",
//         openFiles: [[]],
//         focussedFileIndices: [0],
//       },
//       auth: {
//         user: user2,
//       },
//     };
//     mockedStore = mockStore(initialState);
//     localStorage.setItem("awaitingSave", "true");
//     remixAction = { type: "REMIX_PROJECT" };
//     remixProject = jest.fn(() => remixAction);
//     syncProject.mockImplementationOnce(jest.fn((_) => remixProject));
//     render(
//       <Provider store={mockedStore}>
//         <MemoryRouter>
//           <div id="app">
//             <ProjectComponentLoader match={{ params: {} }} />
//           </div>
//         </MemoryRouter>
//       </Provider>,
//     );
//     expectedActions = [setProject(defaultPythonProject)];
//   });

//   afterEach(() => {
//     localStorage.clear();
//   });

//   test("Project remixed and saved to database", async () => {
//     expectedActions.push(remixAction);
//     await waitFor(
//       () =>
//         expect(remixProject).toHaveBeenCalledWith({
//           project,
//           accessToken: user2.access_token,
//         }),
//       { timeout: 2100 },
//     );
//     expect(mockedStore.getActions()).toEqual(expectedActions);
//   });
// });

// describe("When logged in and project has no identifier and awaiting save", () => {
//   let mockedStore;
//   let saveProject;
//   let saveAction;
//   let expectedActions;

//   beforeEach(() => {
//     const middlewares = [];
//     const mockStore = configureStore(middlewares);
//     const initialState = {
//       editor: {
//         project: { ...project, identifier: null },
//         loading: "success",
//         openFiles: [[]],
//         focussedFileIndices: [0],
//       },
//       auth: {
//         user: user2,
//       },
//     };
//     mockedStore = mockStore(initialState);
//     localStorage.setItem("awaitingSave", "true");
//     saveAction = { type: "SAVE_PROJECT" };
//     saveProject = jest.fn(() => saveAction);
//     syncProject.mockImplementationOnce(jest.fn((_) => saveProject));
//     render(
//       <Provider store={mockedStore}>
//         <MemoryRouter>
//           <div id="app">
//             <ProjectComponentLoader match={{ params: {} }} />
//           </div>
//         </MemoryRouter>
//       </Provider>,
//     );
//     expectedActions = [setProject(defaultPythonProject)];
//   });

//   afterEach(() => {
//     localStorage.clear();
//   });

//   test("Project saved to database", async () => {
//     expectedActions.push(saveAction);
//     await waitFor(
//       () =>
//         expect(saveProject).toHaveBeenCalledWith({
//           project: { ...project, identifier: null },
//           accessToken: user2.access_token,
//           autosave: false,
//         }),
//       { timeout: 2100 },
//     );
//     expect(mockedStore.getActions()).toEqual(expectedActions);
//   });
// });

// describe("When logged in and user owns project", () => {
//   let mockedStore;
//   let expectedActions;

//   beforeEach(() => {
//     const middlewares = [];
//     const mockStore = configureStore(middlewares);
//     const initialState = {
//       editor: {
//         project,
//         loading: "success",
//         openFiles: [[]],
//         focussedFileIndices: [0],
//       },
//       auth: {
//         user: user1,
//       },
//     };
//     mockedStore = mockStore(initialState);
//     render(
//       <Provider store={mockedStore}>
//         <MemoryRouter>
//           <div id="app">
//             <ProjectComponentLoader match={{ params: {} }} />
//           </div>
//         </MemoryRouter>
//       </Provider>,
//     );
//     expectedActions = [setProject(defaultPythonProject)];
//   });

//   test("Project autosaved to database", async () => {
//     const saveAction = { type: "SAVE_PROJECT" };
//     const saveProject = jest.fn(() => saveAction);
//     expectedActions.push(saveAction);
//     syncProject.mockImplementationOnce(jest.fn((_) => saveProject));
//     await waitFor(
//       () =>
//         expect(saveProject).toHaveBeenCalledWith({
//           project,
//           accessToken: user1.access_token,
//           autosave: true,
//         }),
//       { timeout: 2100 },
//     );
//     expect(mockedStore.getActions()).toEqual(expectedActions);
//   });
// });
