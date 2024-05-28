import { fireEvent, render, screen } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";

import CreateSingleStudent from "./CreateSingleStudent";
import { createNewStudent } from "../../redux/reducers/schoolReducers";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => jest.fn(),
}));

jest.mock("../../redux/reducers/schoolReducers");

const fillInAndSubmitForm = ({ name, username, password }) => {
  const nameField = screen.getByLabelText(
    /membersPage.createSingleStudent.name/,
  );
  fireEvent.change(nameField, { target: { value: name } });
  const usernameField = screen.getByLabelText(
    /membersPage.createSingleStudent.username/,
  );
  fireEvent.change(usernameField, { target: { value: username } });
  const passwordField = screen.getByLabelText(
    /membersPage.createSingleStudent.password/,
  );
  fireEvent.change(passwordField, { target: { value: password } });
  screen.getByText("membersPage.createSingleStudent.createStudent").click();
};

beforeEach(() => {
  const mockStore = configureStore([]);
  const initialState = {
    school: {
      id: "school-id",
    },
    auth: {
      user: {
        access_token: "1234",
      },
    },
  };
  const store = mockStore(initialState);
  render(
    <Provider store={store}>
      <CreateSingleStudent />
    </Provider>,
  );
});

test("It renders", () => {
  expect(
    screen.queryByText("membersPage.createSingleStudent.title"),
  ).toBeInTheDocument();
});

test("Filling out and submitting the form dispatches createNewStudent with correct details", () => {
  fillInAndSubmitForm({
    name: "Joe Bloggs",
    username: "bloggsy",
    password: "password123",
  });
  expect(createNewStudent).toHaveBeenCalledWith({
    student: {
      name: "Joe Bloggs",
      username: "bloggsy",
      password: "password123",
    },
    schoolId: "school-id",
    accessToken: "1234",
  });
});
