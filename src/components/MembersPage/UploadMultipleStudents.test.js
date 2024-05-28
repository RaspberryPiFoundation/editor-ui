import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import UploadMultipleStudents from "./UploadMultipleStudents";
import { createNewStudent } from "../../redux/reducers/schoolReducers";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => jest.fn(),
}));

jest.mock("../../redux/reducers/schoolReducers");

const middlewares = [];
const mockStore = configureStore(middlewares);
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
const dropCsvFile = async (csvFile) => {
  const dropzone = screen.getByLabelText(
    "membersPage.createMultipleStudents.csvUploadHint",
  );
  Object.defineProperty(dropzone, "files", {
    value: [csvFile],
  });
  await act(async () => {
    fireEvent.drop(dropzone);
  });
};

beforeEach(() => {
  render(
    <Provider store={store}>
      <UploadMultipleStudents />
    </Provider>,
  );
});

test("it renders successfully", () => {
  expect(
    screen.queryByText("membersPage.createMultipleStudents.title"),
  ).toBeInTheDocument();
});

describe("When invalid csv file is uploaded", () => {
  test("It throws error for missing data", async () => {
    const csvFile = new File(
      ["name,username,password\nJoe Bloggs,bloggsy,"],
      "students.csv",
      { type: "text/csv" },
    );
    await dropCsvFile(csvFile);
    await waitFor(() => {
      expect(
        screen.queryByText(
          "Student Joe Bloggs on line 2 is missing the following fields: password",
        ),
      ).toBeInTheDocument();
    });
  });
});

describe("When valid csv file is uploaded", () => {
  beforeEach(async () => {
    const csvFile = new File(
      [
        "name,username,password,age\nJoe Bloggs,bloggsy,password,15\nJane Doe,janedoe1000,pass123,17",
      ],
      "students.csv",
      { type: "text/csv" },
    );
    await dropCsvFile(csvFile);
  });

  test("The submit button is enabled", async () => {
    await waitFor(() =>
      expect(
        screen.getByText("membersPage.createMultipleStudents.createStudents")
          .parentElement,
      ).toBeEnabled(),
    );
  });

  test("It dispatches the create student action for each student", async () => {
    const submitButton = screen.getByText(
      "membersPage.createMultipleStudents.createStudents",
    ).parentElement;
    await waitFor(() => expect(submitButton).toBeEnabled());
    fireEvent.click(submitButton);
    await waitFor(() => expect(createNewStudent).toHaveBeenCalledTimes(2));
  });

  test("It dispatches the create student action with only the relevant data", async () => {
    const submitButton = screen.getByText(
      "membersPage.createMultipleStudents.createStudents",
    ).parentElement;
    await waitFor(() => expect(submitButton).toBeEnabled());
    fireEvent.click(submitButton);
    await waitFor(() =>
      expect(createNewStudent).toHaveBeenCalledWith({
        student: {
          name: "Joe Bloggs",
          username: "bloggsy",
          password: "password",
        },
        schoolId: "school-id",
        accessToken: "1234",
      }),
    );
  });
});
