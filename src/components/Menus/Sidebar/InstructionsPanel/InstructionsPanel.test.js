import { render, screen } from "@testing-library/react";
import InstructionsPanel from "./InstructionsPanel";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

beforeEach(() => {
  const mockStore = configureStore([]);
  const initialState = {
    instructions: {
      project: {
        steps: [{ content: "<p>step 0</p>" }, { content: "<p>step 1</p>" }],
      },
      currentStepPosition: 1,
    },
  };
  const store = mockStore(initialState);
  render(
    <Provider store={store}>
      <InstructionsPanel />
    </Provider>,
  );
});

test("Renders with correct instruction step content", () => {
  expect(screen.queryByText("step 1")).toBeInTheDocument();
});