import { createNewStudent, loadSchool } from "./schoolReducers";
import {
  createStudent,
  getSchool,
  getUserSchool,
} from "../../utils/apiCallHandler";
import SchoolReducer from "../SchoolSlice";

jest.mock("../../utils/apiCallHandler");

const dispatch = jest.fn();
const getState = () => ({});

describe("loadSchool", () => {
  test("it calls getUserSchool when id is not provided", async () => {
    getUserSchool.mockResolvedValueOnce({});
    await loadSchool({ accessToken: "my_token" })(dispatch, getState);

    expect(getUserSchool).toHaveBeenCalledWith("my_token");
  });

  test("it calls getSchool when id is provided", async () => {
    getSchool.mockResolvedValueOnce({});
    await loadSchool({ id: "my_id", accessToken: "my_token" })(
      dispatch,
      getState,
    );

    expect(getSchool).toHaveBeenCalledWith("my_id", "my_token");
  });
});

describe("createStudent", () => {
  test("it calls createStudent", async () => {
    const student = { name: "Alice" };
    const schoolId = "school-id";
    const accessToken = "my_token";
    await createNewStudent({ student, schoolId, accessToken })(
      dispatch,
      getState,
    );
    expect(createStudent).toHaveBeenCalledWith(student, schoolId, accessToken);
  });
});

describe("extraReducers", () => {
  test("it handles school/load/pending", () => {
    const action = { type: loadSchool.pending.type };
    const newState = SchoolReducer({}, action);
    expect(newState).toEqual({ loading: true });
  });

  test("it handles school/load/fulfilled", () => {
    const school = { id: "123", name: "School of Maths" };
    const action = { type: loadSchool.fulfilled.type, payload: school };
    const newState = SchoolReducer({ loading: true }, action);
    expect(newState).toEqual({ loading: false, ...school });
  });

  test("it handles school/load/rejected", () => {
    const action = { type: loadSchool.rejected.type, error: "error message" };
    const newState = SchoolReducer({ loading: true }, action);
    expect(newState).toEqual({ loading: false, error: "error message" });
  });
});
