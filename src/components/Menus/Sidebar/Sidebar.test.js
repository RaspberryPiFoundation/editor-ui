import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Sidebar from "./Sidebar";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";

let images = [
  {
    url: "path/to/image1",
    filename: "image1.jpg",
  },
  {
    filename: "image2.png",
    url: "path/to/image2",
  },
];

const options = ["file", "images", "instructions"];

describe("When project has images", () => {
  describe("and no instructions", () => {
    beforeEach(() => {
      const mockStore = configureStore([]);
      const initialState = {
        editor: {
          project: {
            components: [],
            image_list: images,
          },
        },
        instructions: {},
      };
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <div id="app">
            <Sidebar options={options} />
          </div>
        </Provider>,
      );
    });

    test("Clicking expand opens the file pane", () => {
      const collapseButton = screen.getByTitle("sidebar.collapse");
      fireEvent.click(collapseButton);
      const expandButton = screen.getByTitle("sidebar.expand");
      fireEvent.click(expandButton);
      expect(screen.queryByText("filePanel.files")).toBeInTheDocument();
    });

    test("Sidebar open by default", () => {
      expect(screen.queryByTitle("sidebar.collapse")).toBeInTheDocument();
    });

    test("Clicking collapse closes the sidebar panel", () => {
      const collapseButton = screen.getByTitle("sidebar.collapse");
      fireEvent.click(collapseButton);
      expect(screen.queryByText("filePanel.files")).not.toBeInTheDocument();
    });

    test("Clicking file button opens file panel", () => {
      const collapseButton = screen.getByTitle("sidebar.collapse");
      fireEvent.click(collapseButton);
      const fileButton = screen.getByTitle("sidebar.file");
      fireEvent.click(fileButton);
      expect(screen.queryByText("filePanel.files")).toBeInTheDocument();
    });

    test("Clicking file button a second time closes file pane", () => {
      const collapseButton = screen.getByTitle("sidebar.collapse");
      fireEvent.click(collapseButton);
      const fileButton = screen.getByTitle("sidebar.file");
      fireEvent.click(fileButton);
      fireEvent.click(fileButton);
      expect(screen.queryByText("filePanel.files")).not.toBeInTheDocument();
    });

    test("Shows file icon", () => {
      expect(screen.queryByTitle("sidebar.file")).toBeInTheDocument();
    });

    test("Shows image icon", () => {
      expect(screen.queryByTitle("sidebar.images")).toBeInTheDocument();
    });

    test("Does not show settings icon", () => {
      expect(screen.queryByTitle("sidebar.settings")).not.toBeInTheDocument();
    });

    test("Does not show instructions icon", () => {
      expect(
        screen.queryByTitle("sidebar.instructions"),
      ).not.toBeInTheDocument();
    });

    test("Clicking image icon opens image panel", () => {
      const imageButton = screen.getByTitle("sidebar.images");
      fireEvent.click(imageButton);
      expect(screen.queryByText("imagePanel.gallery")).toBeInTheDocument();
    });
  });

  describe("and instructions", () => {
    beforeEach(() => {
      const mockStore = configureStore([]);
      const initialState = {
        editor: {
          project: {
            components: [],
            image_list: images,
          },
        },
        instructions: {
          project: {
            steps: [{ content: "<p>step 0</p>" }, { content: "<p>step 1</p>" }],
          },
        },
      };
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <div id="app">
            <Sidebar options={options} />
          </div>
        </Provider>,
      );
    });

    test("Clicking expand opens the instructions pane", () => {
      const collapseButton = screen.getByTitle("sidebar.collapse");
      fireEvent.click(collapseButton);
      const expandButton = screen.getByTitle("sidebar.expand");
      fireEvent.click(expandButton);
      expect(
        screen.queryByText("instructionsPanel.projectSteps"),
      ).toBeInTheDocument();
    });

    test("Clicking instructions button opens file panel", () => {
      const collapseButton = screen.getByTitle("sidebar.collapse");
      fireEvent.click(collapseButton);
      const fileButton = screen.getByTitle("sidebar.instructions");
      fireEvent.click(fileButton);
      expect(
        screen.queryByText("instructionsPanel.projectSteps"),
      ).toBeInTheDocument();
    });

    test("Clicking instructions button a second time closes file pane", () => {
      const collapseButton = screen.getByTitle("sidebar.collapse");
      fireEvent.click(collapseButton);
      const fileButton = screen.getByTitle("sidebar.file");
      fireEvent.click(fileButton);
      fireEvent.click(fileButton);
      expect(
        screen.queryByText("instructionsPanel.projectSteps"),
      ).not.toBeInTheDocument();
    });

    test("Shows file icon", () => {
      expect(screen.queryByTitle("sidebar.file")).toBeInTheDocument();
    });

    test("Shows image icon", () => {
      expect(screen.queryByTitle("sidebar.images")).toBeInTheDocument();
    });

    test("Shows instructions icon", () => {
      expect(screen.queryByTitle("sidebar.instructions")).toBeInTheDocument();
    });

    test("Does not show settings icon", () => {
      expect(screen.queryByTitle("sidebar.settings")).not.toBeInTheDocument();
    });

    test("Clicking image icon opens image panel", () => {
      const imageButton = screen.getByTitle("sidebar.images");
      fireEvent.click(imageButton);
      expect(screen.queryByText("imagePanel.gallery")).toBeInTheDocument();
    });
  });
});

describe("When the project has no images", () => {
  beforeEach(() => {
    const mockStore = configureStore([]);
    const initialState = {
      editor: {
        project: {
          components: [],
          image_list: [],
        },
      },
      instructions: {
        project: {
          steps: [],
        },
      },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <div id="app">
          <Sidebar options={options} />
        </div>
      </Provider>,
    );
  });

  test("Shows file icon", () => {
    expect(screen.queryByTitle("sidebar.file")).toBeInTheDocument();
  });

  test("Does not show image icon", () => {
    expect(screen.queryByTitle("sidebar.images")).not.toBeInTheDocument();
  });

  test("Does not show instructions icon", () => {
    expect(screen.queryByTitle("sidebar.instructions")).not.toBeInTheDocument();
  });
});

describe("When the project has instructions", () => {
  beforeEach(() => {
    const mockStore = configureStore([]);
    const initialState = {
      editor: {
        project: {
          components: [],
          image_list: [],
        },
      },
      instructions: {
        project: {
          steps: [["Something"], ["Something else"]],
        },
      },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <div id="app">
          <Sidebar options={options} />
        </div>
      </Provider>,
    );
  });

  test("Shows instructions icon", () => {
    expect(screen.queryByTitle("sidebar.instructions")).toBeInTheDocument();
  });
});

describe("When the project has no instructions", () => {
  describe("When instructions are not editable", () => {
    beforeEach(() => {
      const mockStore = configureStore([]);
      const initialState = {
        editor: {
          project: {
            components: [],
            image_list: [],
          },
          instructionsEditable: false,
        },
        instructions: {},
      };
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <div id="app">
            <Sidebar options={options} />
          </div>
        </Provider>,
      );
    });

    test("Does not show instructions icon", () => {
      expect(
        screen.queryByTitle("sidebar.instructions"),
      ).not.toBeInTheDocument();
    });
  });

  describe("When instructions are editable", () => {
    beforeEach(() => {
      const mockStore = configureStore([]);
      const initialState = {
        editor: {
          project: {
            components: [],
            image_list: [],
          },
          instructionsEditable: true,
        },
        instructions: {},
      };
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <div id="app">
            <Sidebar options={options} />
          </div>
        </Provider>,
      );
    });

    test("Show instructions icon", () => {
      expect(screen.queryByTitle("sidebar.instructions")).toBeInTheDocument();
    });

    test("Renders instructions panel open by default", () => {
      expect(
        screen.queryByText("instructionsPanel.projectSteps"),
      ).toBeInTheDocument();
    });
  });
});

describe("When plugins are provided", () => {
  const initialState = {
    editor: {
      project: {
        components: [],
        image_list: [],
      },
      instructionsEditable: false,
    },
    instructions: {},
  };
  const mockStore = configureStore([]);
  const store = mockStore(initialState);
  const defaultPlugin = {
    name: "my-amazing-plugin",
    icon: () => {},
    heading: "My amazing plugin",
    title: "my amazing plugin",
    panel: () => <p>My amazing content</p>,
    buttons: () => [<button>My amazing button</button>],
  };

  describe("when plugin has autoOpen true", () => {
    beforeEach(() => {
      const plugins = [
        {
          ...defaultPlugin,
          autoOpen: true,
        },
      ];
      render(
        <Provider store={store}>
          <div id="app">
            <Sidebar options={options} plugins={plugins} />
          </div>
        </Provider>,
      );
    });

    test("Shows plugin icon", () => {
      expect(screen.queryByTitle("my amazing plugin")).toBeInTheDocument();
    });

    test("Render the plugin panel open by default", () => {
      expect(screen.queryByText("My amazing plugin")).toBeInTheDocument();
    });

    test("Renders the plugin content", () => {
      expect(screen.queryByText("My amazing content")).toBeInTheDocument();
    });

    test("Renders the plugin buttons", () => {
      expect(screen.queryByText("My amazing button")).toBeInTheDocument();
    });
  });

  describe("when plugin has autoOpen false", () => {
    beforeEach(() => {
      const plugins = [
        {
          ...defaultPlugin,
          autoOpen: false,
        },
      ];
      render(
        <Provider store={store}>
          <div id="app">
            <Sidebar options={options} plugins={plugins} />
          </div>
        </Provider>,
      );
    });

    test("Shows plugin icon", () => {
      expect(screen.queryByTitle("my amazing plugin")).toBeInTheDocument();
    });

    test("Does not render the plugin panel open by default", () => {
      expect(screen.queryByText("My amazing plugin")).not.toBeInTheDocument();
    });

    test("Opening the panel shows the plugin heading", () => {
      const pluginButton = screen.getByTitle("my amazing plugin");
      fireEvent.click(pluginButton);
      expect(screen.queryByText("My amazing plugin")).toBeInTheDocument();
    });

    test("Opening the panel shows the plugin content", () => {
      const pluginButton = screen.getByTitle("my amazing plugin");
      fireEvent.click(pluginButton);
      expect(screen.queryByText("My amazing content")).toBeInTheDocument();
    });
  });
});
