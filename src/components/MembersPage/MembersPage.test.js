import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import MembersPage from "./MembersPage";

const middlewares = [];
const mockStore = configureStore(middlewares);

beforeEach(() => {
  const store = mockStore({ auth: {} });
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
