import React from "react";
import { render, screen } from "@testing-library/react";
import ResizableWithHandle from "./ResizableWithHandle";

test("renders a horizontal handle", () => {
  render(<ResizableWithHandle handleDirection="bottom"><hr /></ResizableWithHandle>);
  expect(screen.getByTestId("horizontalHandle")).toBeTruthy();
});

test("renders a vertical handle", () => {
  render(<ResizableWithHandle handleDirection="right"><hr /></ResizableWithHandle>);
  expect(screen.getByTestId("verticalHandle")).toBeTruthy();
});

test("it does not add an incorrect class to the handle", () => {
  const { container } = render(
    <ResizableWithHandle handleDirection="bottom"><hr /></ResizableWithHandle>,
  );
  expect(
    container.getElementsByClassName("resizable-with-handle__handle--right")
      .length,
  ).toBe(0);
});

test("it adds the expected class to the handle", () => {
  const { container } = render(
    <ResizableWithHandle handleDirection="bottom"><hr /></ResizableWithHandle>,
  );
  expect(
    container.getElementsByClassName("resizable-with-handle__handle--bottom")
      .length,
  ).toBe(1);
});
