import { renderHook } from "@testing-library/react";
import useSchool from "./useSchool";
import { loadSchool } from "../redux/reducers/schoolReducers";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => jest.fn(),
}));

jest.mock("../redux/reducers/schoolReducers");

const id = "abcd";
const accessToken = "1234";

beforeEach(() => {
  renderHook(() =>
    useSchool({
      id,
      accessToken,
    }),
  );
});

test("it dispatches the loadSchool action", () => {
  expect(loadSchool).toHaveBeenCalledWith({ id, accessToken });
});
