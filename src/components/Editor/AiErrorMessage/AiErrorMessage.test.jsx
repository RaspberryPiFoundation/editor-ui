import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { fireEvent, render, screen } from "@testing-library/react";
import AiErrorMessage from "./AiErrorMessage";
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

const buildState = ({
  aiErrorsEnabled = true,
  user = { access_token: accessToken },
  details = errorDetails,
} = {}) => ({
  editor: {
    aiErrorsEnabled,
    errorDetails: details,
    project: { components },
    reactAppApiEndpoint: "http://localhost:3009",
  },
  auth: { user },
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

let getAiErrorHint;

beforeEach(() => {
  getAiErrorHint = vi.fn();
  ApiCallHandler.mockImplementation(() => ({ getAiErrorHint }));
});

describe("When AI errors are not available", () => {
  test("Renders nothing when aiErrorsEnabled is false", () => {
    const { container } = renderAiErrorMessage(
      buildState({ aiErrorsEnabled: false }),
    );
    expect(container).toBeEmptyDOMElement();
  });

  test("Renders nothing when the user is not logged in", () => {
    const { container } = renderAiErrorMessage(buildState({ user: null }));
    expect(container).toBeEmptyDOMElement();
  });
});

describe("When AI errors are available", () => {
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
    clickButton();

    await screen.findByText("A friendly hint");
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

    resolveRequest({ data: { fem: "A friendly hint" } });
    await screen.findByText("A friendly hint");
    expect(
      screen.queryByText("output.aiErrorMessages.loadingText"),
    ).not.toBeInTheDocument();
  });

  test("Shows the hint and heading, and hides the button, on success", async () => {
    getAiErrorHint.mockResolvedValue({ data: { fem: "A friendly hint" } });
    renderAiErrorMessage();
    clickButton();

    expect(await screen.findByText("A friendly hint")).toBeInTheDocument();
    expect(
      screen.getByText("output.aiErrorMessages.aiGeneratedHint"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("output.aiErrorMessages.buttonText"),
    ).not.toBeInTheDocument();
  });

  test("Shows the error text and keeps the button when the request fails", async () => {
    getAiErrorHint.mockRejectedValue(new Error("Bad gateway"));
    renderAiErrorMessage();
    clickButton();

    expect(
      await screen.findByText("output.aiErrorMessages.errorText"),
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

    clickButton();
    await screen.findByText("output.aiErrorMessages.errorText");

    clickButton();
    expect(await screen.findByText("A friendly hint")).toBeInTheDocument();
    expect(
      screen.queryByText("output.aiErrorMessages.errorText"),
    ).not.toBeInTheDocument();
  });

  test("Resets to the button when a new error occurs", async () => {
    getAiErrorHint.mockResolvedValue({ data: { fem: "A friendly hint" } });
    const { rerender } = renderAiErrorMessage();
    clickButton();
    await screen.findByText("A friendly hint");

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
