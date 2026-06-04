import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { SettingsContext } from "../../../utils/settings";
import ErrorMessage from "./ErrorMessage";
import { render, screen } from "@testing-library/react";

describe("When error is set", () => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);

  describe("When friendlyError is not set", () => {
    beforeEach(() => {
      const initialState = {
        editor: {
          error: "Oops",
        },
      };
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <SettingsContext.Provider
            value={{ theme: "dark", fontSize: "myFontSize" }}
          >
            <ErrorMessage />
          </SettingsContext.Provider>
        </Provider>,
      );
    });

    test("Error message displays", () => {
      expect(screen.queryByText("Oops")).toBeInTheDocument();
    });

    test("Font size class is set correctly", () => {
      const errorMessage = screen.queryByText("Oops").parentElement;
      expect(errorMessage).toHaveClass("error-message__python--myFontSize");
    });

    test("Does not display friendly error elements", () => {
      expect(
        document.querySelector(".error-message__friendly"),
      ).not.toBeInTheDocument();
    });
  });

  describe("When friendlyError is set", () => {
    beforeEach(() => {
      const initialState = {
        editor: {
          error: "An error occurred",
          friendlyError: {
            html: '<div class="pfem__title">Friendly Error Title</div><div class="pfem__summary">This is a more user-friendly explanation of the error.</div><div class="pfem__why">A variable created in another place might not be available here.</div><ul class="pfem__steps"><li>Move the line that makes it to above where you use it.</li><li>Or set it here just before you use it.</li></ul><pre class="pfem__patch">kettle = 0</pre><details class="pfem__details"><summary>Original error</summary><pre>An error occurred</pre></details>',
          },
        },
      };
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <SettingsContext.Provider
            value={{ theme: "dark", fontSize: "myFontSize" }}
          >
            <ErrorMessage />
          </SettingsContext.Provider>
        </Provider>,
      );
    });

    test("Friendly error title and summary display", () => {
      expect(screen.getByText("Friendly Error Title")).toBeInTheDocument();
      expect(
        screen.getByText(
          "This is a more user-friendly explanation of the error.",
        ),
      ).toBeInTheDocument();
    });

    it("strips unsafe scripts", () => {
      const initialState = {
        editor: {
          error: "An error occurred",
          friendlyError: {
            html: `
                <div class="pfem__title">Friendly Error Title</div>
                <img src="x" onerror="alert('xss')" />
                <script>alert("xss")</script>
                <a href="javascript:alert('xss')">Bad link</a>
              `,
          },
        },
      };
      const store = mockStore(initialState);
      const { container } = render(
        <Provider store={store}>
          <SettingsContext.Provider
            value={{ theme: "dark", fontSize: "myFontSize" }}
          >
            <ErrorMessage />
          </SettingsContext.Provider>
        </Provider>,
      );

      expect(container.querySelector("script")).not.toBeInTheDocument();
      expect(container.querySelector("[onerror]")).not.toBeInTheDocument();
      expect(
        container.querySelector('a[href^="javascript:"]'),
      ).not.toBeInTheDocument();
    });
  });

  it("should render links correctly within the error message", () => {
    const initialState = {
      editor: {
        error: `ImportError: No module named pd on line 2 of main.py. You should check your code for typos. If you are using p5, py5, sense_hat or turtle, pd might not work - read this <a href=https://help.editor.raspberrypi.org/hc/en-us/articles/30841379339924-What-Python-libraries-are-available-in-the-Code-Editor>article</a> for more information.`,
      },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <SettingsContext.Provider
          value={{ theme: "dark", fontSize: "myFontSize" }}
        >
          <ErrorMessage />
        </SettingsContext.Provider>
      </Provider>,
    );

    const linkElement = screen.getByRole("link", { name: "article" });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute(
      "href",
      "https://help.editor.raspberrypi.org/hc/en-us/articles/30841379339924-What-Python-libraries-are-available-in-the-Code-Editor",
    );
  });
});
