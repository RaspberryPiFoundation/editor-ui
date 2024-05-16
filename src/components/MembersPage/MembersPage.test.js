import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import MembersPage from "./MembersPage";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import useSchool from "../../hooks/useSchool";

jest.mock("../../hooks/useSchool", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const middlewares = [];
const mockStore = configureStore(middlewares);

beforeEach(() => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    auth: {
      user: {
        access_token: "1234",
      },
    },
  };
  const store = mockStore(initialState);
  render(
    <BrowserRouter>
      <Provider store={store}>
        <MembersPage />
      </Provider>
    </BrowserRouter>,
  );
});

test("it renders", () => {
  expect(screen.getByTestId("members-page")).toBeInTheDocument();
});

test("it loads up the school", () => {
  expect(useSchool).toHaveBeenCalledWith({
    accessToken: "1234",
  });
});
