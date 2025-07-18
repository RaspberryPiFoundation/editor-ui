import { toast } from "react-toastify";
import {
  showLoginPrompt,
  showSavedMessage,
  showSavePrompt,
} from "./Notifications";

jest.mock("./i18n", () => ({
  t: (string) => string,
}));
jest.mock("react-toastify");

test("Calling showSavedMessage calls toast with correct string", () => {
  showSavedMessage();
  expect(toast).toHaveBeenCalledWith(
    "notifications.projectSaved",
    expect.anything(),
  );
});

test("Calling showSavePrompt calls toast with correct string", () => {
  showSavePrompt();
  expect(toast).toHaveBeenCalledWith(
    "notifications.savePrompt",
    expect.anything(),
  );
});

test("Calling showLoginPrompt calls toast with correct string", () => {
  showLoginPrompt();
  expect(toast).toHaveBeenCalledWith(
    "notifications.loginPrompt",
    expect.anything(),
  );
});
