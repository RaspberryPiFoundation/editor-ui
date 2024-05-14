import { render, screen } from "@testing-library/react";
import MembersPage from "./MembersPage";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import useSchool from "../../hooks/useSchool";

jest.mock("../../hooks/useSchool", () => ({
  __esModule: true,
  default: jest.fn(),
}));

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
    <Provider store={store}>
      <MembersPage />
    </Provider>,
  );
});

test("it renders", () => {
  expect(screen.queryByText("membersPage.title")).toBeInTheDocument();
});

test("it loads up the school", () => {
  expect(useSchool).toHaveBeenCalledWith({
    accessToken: "1234",
  });
});
