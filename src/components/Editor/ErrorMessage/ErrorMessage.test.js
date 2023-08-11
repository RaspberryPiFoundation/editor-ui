import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { SettingsContext } from "../../../settings";
import ErrorMessage from "./ErrorMessage";
import { render, screen } from "@testing-library/react";

describe("When error is set", () => {
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
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
    expect(errorMessage).toHaveClass("error-message--myFontSize");
  });
});
