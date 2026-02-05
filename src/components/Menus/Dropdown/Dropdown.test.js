import { fireEvent, render, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Dropdown from "./Dropdown";

const buttonIcon = () => {
  return (
    <svg>
      <title>my icon</title>
    </svg>
  );
};
const MenuContent = () => {
  return <h1>Menu</h1>;
};
let queryByTitle;
let queryByText;
let getByText;
let queryByRole;

beforeEach(() => {
  ({ getByText, queryByRole, queryByText, queryByTitle } = render(
    <Dropdown
      ButtonIcon={buttonIcon}
      buttonText="my button"
      MenuContent={MenuContent}
    />,
  ));
});

test("Button icon renders", () => {
  expect(queryByTitle("my icon")).not.toBeNull();
});

test("Button text renders", () => {
  expect(queryByText("my button")).not.toBeNull();
});

test("Menu content not disable intially", () => {
  expect(queryByRole("heading", { level: 1, name: "Menu" })).toBeNull();
});

test("Clicking button makes menu content appear", () => {
  const button = getByText("my button").parentElement;
  fireEvent.click(button);
  expect(queryByRole("heading", { level: 1, name: "Menu" })).not.toBeNull();
});

test("Clicking outside menu makes it close", async () => {
  const button = getByText("my button").parentElement;
  await act(() => {
    fireEvent.click(button);
    userEvent.click(document.body);
  });
  expect(queryByRole("heading", { level: 1, name: "Menu" })).toBeNull();
});
