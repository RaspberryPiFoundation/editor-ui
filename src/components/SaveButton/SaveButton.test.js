import React from "react";
import { fireEvent, screen } from "@testing-library/react";
import renderWithProviders from "../../utils/renderWithProviders";
import SaveButton from "./SaveButton";

const logInHandler = jest.fn();

describe("When project is loaded", () => {
  beforeAll(() => {
    document.addEventListener("editor-logIn", logInHandler);
  });

  describe("With logged in user", () => {
    let store;

    describe("who doesn't own the project", () => {
      beforeEach(() => {
        const preloadedState = {
          editor: {
            loading: "success",
            webComponent: true,
            project: {
              identifier: "hot-diggity-dog",
              user_id: "some-other-user",
            },
          },
          auth: {
            user: {
              profile: {
                user: "some-dummy-user",
              },
            },
          },
        };
        ({ store } = renderWithProviders(<SaveButton />, {
          preloadedState,
        }));
      });

      test("Save button renders", () => {
        expect(screen.queryByText("header.save")).toBeInTheDocument();
      });

      test("Does not render a login to save button", () => {
        expect(
          screen.queryByText("header.loginToSave"),
        ).not.toBeInTheDocument();
      });

      test("Clicking save updates the save-triggered state", () => {
        const saveButton = screen.queryByText("header.save");
        fireEvent.click(saveButton);
        expect(store.getState().editor.saveTriggered).toBe(true);
      });

      test("Clicking save triggers a logInHandler event", () => {
        const saveButton = screen.queryByText("header.save").parentElement;
        fireEvent.click(saveButton);
        expect(logInHandler).toHaveBeenCalled();
      });
    });

    describe("who does own the project", () => {
      beforeEach(() => {
        const preloadedState = {
          editor: {
            loading: "success",
            webComponent: true,
            project: {
              identifier: "hot-diggity-dog",
              user_id: "some-dummy-user",
            },
          },
          auth: {
            user: {
              profile: {
                user: "some-dummy-user",
              },
            },
          },
        };
        ({ store } = renderWithProviders(<SaveButton />, {
          preloadedState,
        }));
      });

      test("Does not render save button", () => {
        expect(screen.queryByText("header.save")).not.toBeInTheDocument();
      });

      test("Does not render a login to save button", () => {
        expect(
          screen.queryByText("header.loginToSave"),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Without a logged in user", () => {
    let store;

    beforeEach(() => {
      const preloadedState = {
        editor: {
          loading: "success",
          webComponent: false,
        },
        auth: {},
      };
      ({ store } = renderWithProviders(<SaveButton />, {
        preloadedState,
      }));
    });

    test("Login to save button renders", () => {
      expect(screen.queryByText("header.loginToSave")).toBeInTheDocument();
    });

    test("Does not render a save button", () => {
      expect(screen.queryByText("header.save")).not.toBeInTheDocument();
    });

    test("Clicking save updates the save-triggered state", () => {
      const saveButton = screen.queryByText("header.loginToSave");
      fireEvent.click(saveButton);
      expect(store.getState().editor.saveTriggered).toBe(true);
    });

    test("Clicking save triggers a logInHandler event", () => {
      const saveButton = screen.queryByText("header.loginToSave").parentElement;
      fireEvent.click(saveButton);
      expect(logInHandler).toHaveBeenCalled();
    });
  });

  describe("with webComponent=false", () => {
    beforeEach(() => {
      const preloadedState = {
        editor: {
          loading: "success",
          webComponent: false,
        },
        auth: {},
      };
      renderWithProviders(<SaveButton />, {
        preloadedState,
      });
    });

    test("Renders a secondary button", () => {
      const saveButton = screen.queryByText("header.loginToSave").parentElement;
      expect(saveButton).toHaveClass("btn--secondary");
    });
  });

  describe("with webComponent=true", () => {
    beforeEach(() => {
      const preloadedState = {
        editor: {
          loading: "success",
          webComponent: true,
        },
        auth: {},
      };
      renderWithProviders(<SaveButton />, {
        preloadedState,
      });
    });

    test("Renders a primary button", () => {
      const saveButton = screen.queryByText("header.loginToSave").parentElement;
      expect(saveButton).toHaveClass("btn--primary");
    });
  });

  afterAll(() => {
    document.removeEventListener("editor-logIn", logInHandler);
  });
});

describe("When project is not loaded", () => {
  beforeEach(() => {
    renderWithProviders(<SaveButton />, {
      preloadedState: {
        editor: {},
        auth: {},
      },
    });
  });

  test("Does not render a login to save button", () => {
    expect(screen.queryByText("header.loginToSave")).not.toBeInTheDocument();
  });

  test("Does not render a save button", () => {
    expect(screen.queryByText("header.save")).not.toBeInTheDocument();
  });
});
