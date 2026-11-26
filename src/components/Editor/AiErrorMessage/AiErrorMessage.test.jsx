import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { act, fireEvent, render, screen } from "@testing-library/react";
import AiErrorMessage, { MIN_LOADING_MS } from "./AiErrorMessage";
import ApiCallHandler from "../../../utils/apiCallHandler";
import pollAiHint from "../../../utils/pollAiHint";
import { AI_HINT_LEARN_MORE_URL } from "../../../utils/aiHintLinks";

vi.mock("../../../utils/apiCallHandler");
vi.mock("../../../utils/pollAiHint");

vi.mock("react-i18next", async () => {
  const { cloneElement, createElement } = await vi.importActual("react");
  return {
    useTranslation: () => ({ t: (str) => str }),
    Trans: ({ i18nKey, components = {} }) => [
      createElement("span", { key: i18nKey }, i18nKey),
      ...Object.entries(components).map(([name, element]) =>
        cloneElement(element, { key: name }, name),
      ),
    ],
  };
});

const middlewares = [];
const mockStore = configureStore(middlewares);

const accessToken = "39a09671-be55-4847-baf5-8919a0c24a25";
const errorDetails = {
  type: "NameError",
  line: 1,
  file: "main.py",
  message: "NameError: name 'prnt' is not defined on line 1 of main.py",
  trace: "NameError: name 'prnt' is not defined on line 1 of main.py",
  runtime: "skulpt",
};
const components = [
  { name: "main", extension: "py", content: 'prnt("Hello world")' },
  { name: "other", extension: "py", content: "print('other')" },
];

const buildState = ({ details = errorDetails } = {}) => ({
  editor: {
    errorDetails: details,
    project: { components },
    reactAppApiEndpoint: "http://localhost:3009",
  },
  auth: { user: { access_token: accessToken } },
});

let store;

const renderAiErrorMessage = (state = buildState()) => {
  store = mockStore(state);
  return render(
    <Provider store={store}>
      <AiErrorMessage />
    </Provider>,
  );
};

const hintButton = () => document.querySelector(".ai-error-message__button");

const clickButton = () => fireEvent.click(hintButton());

const advanceTimers = (ms) => act(() => vi.advanceTimersByTimeAsync(ms));

const clickButtonAndWait = async () => {
  clickButton();
  await advanceTimers(MIN_LOADING_MS);
};

const hintId = "6f1c1e2a-3b4d-4e5f-8a9b-0c1d2e3f4a5b";

let createAiHint;
let getAiHint;

beforeEach(() => {
  vi.useFakeTimers();
  createAiHint = vi.fn().mockResolvedValue({ data: { id: hintId } });
  getAiHint = vi.fn();
  ApiCallHandler.mockImplementation(() => ({ createAiHint, getAiHint }));
  pollAiHint.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("AiErrorMessage", () => {
  test("Shows the generate hint button", () => {
    renderAiErrorMessage();
    expect(
      screen.getByText("output.aiErrorMessages.buttonText"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("output.aiErrorMessages.aiGeneratedHint"),
    ).not.toBeInTheDocument();
  });

  test("Shows the AI notice", () => {
    renderAiErrorMessage();
    expect(
      screen.getByText("output.aiErrorMessages.notice"),
    ).toBeInTheDocument();
  });

  test("Creates the hint with the error details, main.py code and access token", async () => {
    pollAiHint.mockResolvedValue("A friendly hint");
    renderAiErrorMessage();
    await clickButtonAndWait();

    expect(ApiCallHandler).toHaveBeenCalledWith({
      reactAppApiEndpoint: "http://localhost:3009",
    });
    expect(createAiHint).toHaveBeenCalledWith(
      {
        message: errorDetails.message,
        trace: errorDetails.trace,
        runtime: errorDetails.runtime,
        code: 'prnt("Hello world")',
      },
      accessToken,
    );
  });

  test("Polls for the created hint with the access token and an abort signal", async () => {
    pollAiHint.mockResolvedValue("A friendly hint");
    renderAiErrorMessage();
    await clickButtonAndWait();

    expect(pollAiHint).toHaveBeenCalledWith(hintId, {
      getAiHint: expect.any(Function),
      signal: expect.any(AbortSignal),
    });

    const pollOptions = pollAiHint.mock.calls[0][1];
    const pollGetAiHint = pollOptions.getAiHint;
    const signal = pollOptions.signal;
    pollGetAiHint(hintId, { signal });
    expect(getAiHint).toHaveBeenCalledWith(hintId, accessToken, { signal });
  });

  test("Shows loading text while the hint is being generated", async () => {
    let resolveRequest;
    pollAiHint.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    renderAiErrorMessage();
    clickButton();

    expect(hintButton()).toHaveAttribute("aria-busy", "true");
    expect(
      screen.getAllByText("output.aiErrorMessages.loadingText").length,
    ).toBeGreaterThan(0);

    await act(async () => resolveRequest("A friendly hint"));
    await advanceTimers(MIN_LOADING_MS);
    expect(screen.getByText("A friendly hint")).toBeInTheDocument();
    expect(
      screen.queryByText("output.aiErrorMessages.loadingText"),
    ).not.toBeInTheDocument();
  });

  test("Shows the hint and heading, and hides the button, on success", async () => {
    pollAiHint.mockResolvedValue("A friendly hint");
    renderAiErrorMessage();
    await clickButtonAndWait();

    expect(screen.getByText("A friendly hint")).toBeInTheDocument();
    expect(
      screen.getByText("output.aiErrorMessages.aiGeneratedHint"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("output.aiErrorMessages.buttonText"),
    ).not.toBeInTheDocument();
  });

  test("Moves focus to the hint when it replaces the button", async () => {
    pollAiHint.mockResolvedValue("A friendly hint");
    renderAiErrorMessage();
    hintButton().focus();
    await clickButtonAndWait();

    expect(document.querySelector(".ai-error-message__hint")).toHaveFocus();
  });

  test("Moves focus to the error text when the request fails", async () => {
    pollAiHint.mockRejectedValue(new Error("Hint failed"));
    renderAiErrorMessage();
    hintButton().focus();
    await clickButtonAndWait();

    expect(document.querySelector(".ai-error-message__hint")).toHaveFocus();
  });

  test("Does not move focus before a hint is requested", () => {
    renderAiErrorMessage();

    expect(document.body).toHaveFocus();
  });

  test("Keeps loading for the minimum time when the response is fast", async () => {
    pollAiHint.mockResolvedValue("A friendly hint");
    renderAiErrorMessage();
    clickButton();

    await advanceTimers(MIN_LOADING_MS - 1);
    expect(screen.queryByText("A friendly hint")).not.toBeInTheDocument();
    expect(hintButton()).toHaveAttribute("aria-busy", "true");

    await advanceTimers(1);
    expect(screen.getByText("A friendly hint")).toBeInTheDocument();
  });

  test("Keeps loading for the minimum time when the request fails fast", async () => {
    pollAiHint.mockRejectedValue(new Error("Hint failed"));
    renderAiErrorMessage();
    clickButton();

    await advanceTimers(MIN_LOADING_MS - 1);
    expect(
      screen.queryByText("output.aiErrorMessages.errorText"),
    ).not.toBeInTheDocument();

    await advanceTimers(1);
    expect(
      screen.getByText("output.aiErrorMessages.errorText"),
    ).toBeInTheDocument();
  });

  test("Shows the error text and keeps the button when the request fails", async () => {
    pollAiHint.mockRejectedValue(new Error("Hint failed"));
    renderAiErrorMessage();
    await clickButtonAndWait();

    expect(
      screen.getByText("output.aiErrorMessages.aiGeneratedHint"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("output.aiErrorMessages.errorText"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("output.aiErrorMessages.retryButtonText"),
    ).toBeInTheDocument();
  });

  test("Shows the error text without polling when creating the hint fails", async () => {
    createAiHint.mockRejectedValue(new Error("Bad gateway"));
    renderAiErrorMessage();
    await clickButtonAndWait();

    expect(
      screen.getByText("output.aiErrorMessages.errorText"),
    ).toBeInTheDocument();
    expect(pollAiHint).not.toHaveBeenCalled();
  });

  test("Shows the error text without polling when no hint id is returned", async () => {
    createAiHint.mockResolvedValue({ data: {} });
    renderAiErrorMessage();
    await clickButtonAndWait();

    expect(
      screen.getByText("output.aiErrorMessages.errorText"),
    ).toBeInTheDocument();
    expect(pollAiHint).not.toHaveBeenCalled();
  });

  test("Clears the error text and shows the hint when a retry succeeds", async () => {
    pollAiHint
      .mockRejectedValueOnce(new Error("Hint failed"))
      .mockResolvedValueOnce("A friendly hint");
    renderAiErrorMessage();

    await clickButtonAndWait();
    expect(
      screen.getByText("output.aiErrorMessages.errorText"),
    ).toBeInTheDocument();

    await clickButtonAndWait();
    expect(screen.getByText("A friendly hint")).toBeInTheDocument();
    expect(
      screen.queryByText("output.aiErrorMessages.errorText"),
    ).not.toBeInTheDocument();
  });

  test("Resets to the button when a new error occurs", async () => {
    pollAiHint.mockResolvedValue("A friendly hint");
    const { rerender } = renderAiErrorMessage();
    await clickButtonAndWait();
    expect(screen.getByText("A friendly hint")).toBeInTheDocument();

    const newStore = mockStore(
      buildState({ details: { ...errorDetails, line: 2 } }),
    );
    rerender(
      <Provider store={newStore}>
        <AiErrorMessage />
      </Provider>,
    );

    expect(screen.queryByText("A friendly hint")).not.toBeInTheDocument();
    expect(
      screen.getByText("output.aiErrorMessages.buttonText"),
    ).toBeInTheDocument();
  });

  describe("stopping polling", () => {
    const pollSignal = () => pollAiHint.mock.calls[0][1].signal;

    beforeEach(() => {
      pollAiHint.mockReturnValue(new Promise(() => {}));
    });

    test("Aborts polling when the component unmounts", async () => {
      const { unmount } = renderAiErrorMessage();
      await clickButtonAndWait();
      expect(pollSignal().aborted).toBe(false);

      unmount();

      expect(pollSignal().aborted).toBe(true);
    });

    test("Aborts polling when a new error occurs", async () => {
      const { rerender } = renderAiErrorMessage();
      await clickButtonAndWait();

      rerender(
        <Provider
          store={mockStore(
            buildState({ details: { ...errorDetails, line: 2 } }),
          )}
        >
          <AiErrorMessage />
        </Provider>,
      );

      expect(pollSignal().aborted).toBe(true);
    });
  });

  describe("hint requested event", () => {
    const handler = vi.fn();
    const onHintRequested = (e) => handler(e.detail);

    beforeEach(() => {
      handler.mockClear();
      document.addEventListener("editor-aiHintRequested", onHintRequested);
    });

    afterEach(() => {
      document.removeEventListener("editor-aiHintRequested", onHintRequested);
    });

    test.each([
      ["shown", () => pollAiHint.mockResolvedValue("A hint")],
      ["failed", () => pollAiHint.mockRejectedValue(new Error("Hint failed"))],
    ])("Dispatches the event with outcome %s", async (outcome, mockApi) => {
      mockApi();
      const state = buildState();
      state.editor.project.identifier = "coach-gong-glide";
      renderAiErrorMessage(state);
      await clickButtonAndWait();

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({
        projectIdentifier: "coach-gong-glide",
        errorDetails,
        outcome,
      });
    });

    describe("when the request settles after the user has moved on", () => {
      let settleRequest;

      beforeEach(() => {
        pollAiHint.mockReturnValue(
          new Promise((resolve, reject) => {
            settleRequest = { resolve, reject };
          }),
        );
      });

      const settleWith = {
        success: () => settleRequest.resolve("Stale hint"),
        failure: () => settleRequest.reject(new Error("Hint failed")),
      };

      test.each(Object.keys(settleWith))(
        "Does not dispatch the event on %s after unmount",
        async (result) => {
          const { unmount } = renderAiErrorMessage();
          clickButton();
          unmount();

          await act(async () => settleWith[result]());
          await advanceTimers(MIN_LOADING_MS);

          expect(handler).not.toHaveBeenCalled();
        },
      );

      test.each(Object.keys(settleWith))(
        "Does not dispatch the event or show a result on %s after the error changes",
        async (result) => {
          const { rerender } = renderAiErrorMessage();
          clickButton();

          const newStore = mockStore(
            buildState({ details: { ...errorDetails, line: 2 } }),
          );
          rerender(
            <Provider store={newStore}>
              <AiErrorMessage />
            </Provider>,
          );

          await act(async () => settleWith[result]());
          await advanceTimers(MIN_LOADING_MS);

          expect(handler).not.toHaveBeenCalled();
          expect(screen.queryByText("Stale hint")).not.toBeInTheDocument();
          expect(
            screen.queryByText("output.aiErrorMessages.errorText"),
          ).not.toBeInTheDocument();
          expect(
            screen.getByText("output.aiErrorMessages.buttonText"),
          ).toBeInTheDocument();
        },
      );
    });
  });

  describe("turn off link", () => {
    test("Opens the AI hint settings when turn off is clicked", () => {
      renderAiErrorMessage();
      fireEvent.click(
        screen.getByRole("button", {
          name: "output.aiErrorMessages.turnOff",
        }),
      );
      expect(store.getActions()).toContainEqual({
        type: "editor/openAiHintSettings",
        payload: undefined,
      });
    });

    test("Dispatches the turn off link clicked event with the error", () => {
      const handler = vi.fn();
      const onTurnOffLinkClicked = (e) => handler(e.detail);
      document.addEventListener(
        "editor-aiHintTurnOffLinkClicked",
        onTurnOffLinkClicked,
      );
      const state = buildState();
      state.editor.project.identifier = "coach-gong-glide";
      renderAiErrorMessage(state);
      fireEvent.click(
        screen.getByRole("button", {
          name: "output.aiErrorMessages.turnOff",
        }),
      );
      document.removeEventListener(
        "editor-aiHintTurnOffLinkClicked",
        onTurnOffLinkClicked,
      );
      expect(handler).toHaveBeenCalledWith({
        projectIdentifier: "coach-gong-glide",
        errorDetails,
      });
    });
  });

  describe("learn more link", () => {
    const learnMoreLink = () => screen.getByRole("link", { name: /learnMore/ });

    test("Links to the AI hints help article in a new tab", () => {
      renderAiErrorMessage();
      expect(learnMoreLink()).toHaveAttribute("href", AI_HINT_LEARN_MORE_URL);
      expect(learnMoreLink()).toHaveAttribute("target", "_blank");
    });

    test("Dispatches the learn more link clicked event", () => {
      const handler = vi.fn();
      const onLearnMoreLinkClicked = (e) => handler(e.detail);
      document.addEventListener(
        "editor-aiHintLearnMoreLinkClicked",
        onLearnMoreLinkClicked,
      );
      const state = buildState();
      state.editor.project.identifier = "coach-gong-glide";
      renderAiErrorMessage(state);
      fireEvent.click(learnMoreLink());
      document.removeEventListener(
        "editor-aiHintLearnMoreLinkClicked",
        onLearnMoreLinkClicked,
      );
      expect(handler).toHaveBeenCalledWith({
        projectIdentifier: "coach-gong-glide",
        source: "errorMessage",
      });
    });

    test("Does not dispatch the event when the feedback link is clicked", () => {
      const handler = vi.fn();
      document.addEventListener("editor-aiHintLearnMoreLinkClicked", handler);
      renderAiErrorMessage();
      fireEvent.click(screen.getByRole("link", { name: /feedback/ }));
      document.removeEventListener(
        "editor-aiHintLearnMoreLinkClicked",
        handler,
      );
      expect(handler).not.toHaveBeenCalled();
    });
  });
});
