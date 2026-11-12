import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { SettingsContext } from "../../../utils/settings";
import ErrorMessage from "./ErrorMessage";
import { render, screen } from "@testing-library/react";
import useIsOnline from "../../../hooks/useIsOnline";
import { Cookies, CookiesProvider } from "react-cookie";

const mockI18n = vi.hoisted(() => ({ language: "en" }));

vi.mock("../../../hooks/useIsOnline");

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (str) => str, i18n: mockI18n }),
}));

vi.mock("../AiErrorMessage/AiErrorMessage", () => ({
  default: () => <div>AiErrorMessage</div>,
}));

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

describe("AI hint", () => {
  const mockStore = configureStore([]);

  const renderErrorMessage = ({
    aiErrorsEnabled = true,
    user = { access_token: "token" },
    friendlyError = { html: "<div>Friendly error</div>" },
    language = "en",
    aiHintsCookie,
  } = {}) => {
    mockI18n.language = language;
    const store = mockStore({
      editor: {
        error: "Oops",
        aiErrorsEnabled,
        friendlyErrorsEnabled: true,
        friendlyError,
      },
      auth: { user },
    });
    const cookies = new Cookies();
    if (aiHintsCookie) cookies.set("aiHints", aiHintsCookie);
    render(
      <CookiesProvider cookies={cookies}>
        <Provider store={store}>
          <SettingsContext.Provider
            value={{ theme: "dark", fontSize: "myFontSize" }}
          >
            <ErrorMessage />
          </SettingsContext.Provider>
        </Provider>
      </CookiesProvider>,
    );
  };

  const expectAiHintHidden = () => {
    expect(screen.queryByText("AiErrorMessage")).not.toBeInTheDocument();
  };

  beforeEach(() => {
    useIsOnline.mockReturnValue(true);
  });

  afterEach(() => {
    mockI18n.language = "en";
    new Cookies().remove("aiHints");
  });

  test("displays when all conditions are met", () => {
    renderErrorMessage();
    expect(screen.getByText("AiErrorMessage")).toBeInTheDocument();
  });

  test("displays for regional English locales", () => {
    renderErrorMessage({ language: "en-GB" });
    expect(screen.getByText("AiErrorMessage")).toBeInTheDocument();
  });

  test("does not display when aiErrorsEnabled is false", () => {
    renderErrorMessage({ aiErrorsEnabled: false });
    expectAiHintHidden();
  });

  test("does not display when the user is not logged in", () => {
    renderErrorMessage({ user: null });
    expectAiHintHidden();
  });

  test("does not display when there is no friendly error", () => {
    renderErrorMessage({ friendlyError: null });
    expectAiHintHidden();
  });

  test("does not display when the language is not English", () => {
    renderErrorMessage({ language: "fr-FR" });
    expectAiHintHidden();
  });

  test("does not display when the user is offline", () => {
    useIsOnline.mockReturnValue(false);
    renderErrorMessage();
    expectAiHintHidden();
  });

  test("does not display when the user has turned AI hints off", () => {
    renderErrorMessage({ aiHintsCookie: "off" });
    expectAiHintHidden();
  });

  test("displays when the user has turned AI hints on", () => {
    renderErrorMessage({ aiHintsCookie: "on" });
    expect(screen.getByText("AiErrorMessage")).toBeInTheDocument();
  });
});
