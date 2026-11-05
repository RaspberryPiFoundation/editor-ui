import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { act, fireEvent, render, screen } from "@testing-library/react";
import AiErrorMessage, { MIN_LOADING_MS } from "./AiErrorMessage";
import ApiCallHandler from "../../../utils/apiCallHandler";

vi.mock("../../../utils/apiCallHandler");

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

const renderAiErrorMessage = (state = buildState()) => {
  const store = mockStore(state);
  return render(
    <Provider store={store}>
      <AiErrorMessage />
    </Provider>,
  );
};

const clickButton = () =>
  fireEvent.click(screen.getByText("output.aiErrorMessages.buttonText"));

const advanceTimers = (ms) => act(() => vi.advanceTimersByTimeAsync(ms));

const clickButtonAndWait = async () => {
  clickButton();
  await advanceTimers(MIN_LOADING_MS);
};

let getAiErrorHint;

beforeEach(() => {
  vi.useFakeTimers();
  getAiErrorHint = vi.fn();
  ApiCallHandler.mockImplementation(() => ({ getAiErrorHint }));
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

  test("Sends the error details, main.py code and access token", async () => {
    getAiErrorHint.mockResolvedValue({ data: { fem: "A friendly hint" } });
    renderAiErrorMessage();
    await clickButtonAndWait();

    expect(ApiCallHandler).toHaveBeenCalledWith({
      reactAppApiEndpoint: "http://localhost:3009",
    });
    expect(getAiErrorHint).toHaveBeenCalledWith(
      {
        message: errorDetails.message,
        trace: errorDetails.trace,
        runtime: errorDetails.runtime,
        code: 'prnt("Hello world")',
      },
      accessToken,
    );
  });

  test("Shows loading text while the hint is being generated", async () => {
    let resolveRequest;
    getAiErrorHint.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    renderAiErrorMessage();
    clickButton();

    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
    expect(
      screen.getAllByText("output.aiErrorMessages.loadingText").length,
    ).toBeGreaterThan(0);

    await act(async () => resolveRequest({ data: { fem: "A friendly hint" } }));
    await advanceTimers(MIN_LOADING_MS);
    expect(screen.getByText("A friendly hint")).toBeInTheDocument();
    expect(
      screen.queryByText("output.aiErrorMessages.loadingText"),
    ).not.toBeInTheDocument();
  });

  test("Shows the hint and heading, and hides the button, on success", async () => {
    getAiErrorHint.mockResolvedValue({ data: { fem: "A friendly hint" } });
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

  test("Keeps loading for the minimum time when the response is fast", async () => {
    getAiErrorHint.mockResolvedValue({ data: { fem: "A friendly hint" } });
    renderAiErrorMessage();
    clickButton();

    await advanceTimers(MIN_LOADING_MS - 1);
    expect(screen.queryByText("A friendly hint")).not.toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");

    await advanceTimers(1);
    expect(screen.getByText("A friendly hint")).toBeInTheDocument();
  });

  test("Keeps loading for the minimum time when the request fails fast", async () => {
    getAiErrorHint.mockRejectedValue(new Error("Bad gateway"));
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
    getAiErrorHint.mockRejectedValue(new Error("Bad gateway"));
    renderAiErrorMessage();
    await clickButtonAndWait();

    expect(
      screen.getByText("output.aiErrorMessages.errorText"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("output.aiErrorMessages.buttonText"),
    ).toBeInTheDocument();
  });

  test("Clears the error text and shows the hint when a retry succeeds", async () => {
    getAiErrorHint
      .mockRejectedValueOnce(new Error("Bad gateway"))
      .mockResolvedValueOnce({ data: { fem: "A friendly hint" } });
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
    getAiErrorHint.mockResolvedValue({ data: { fem: "A friendly hint" } });
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
});
