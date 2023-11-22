import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import ToastCloseButton from "./ToastCloseButton";

const closeToast = jest.fn();

beforeEach(() => {
  render(<ToastCloseButton closeToast={closeToast} />);
});

test("Close button renders", () => {
  expect(screen.queryByRole("button")).toBeInTheDocument();
});

test("Clicking close button calls closeToast function", () => {
  const closeButton = screen.queryByRole("button");
  fireEvent.click(closeButton);
  expect(closeToast).toHaveBeenCalled();
});
