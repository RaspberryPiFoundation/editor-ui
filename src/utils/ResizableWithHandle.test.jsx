import React from "react";
import { act, render, screen } from "@testing-library/react";
import ResizableWithHandle from "./ResizableWithHandle";

let mockResizeStop;

jest.mock("re-resizable", () => ({
  Resizable: ({
    children,
    handleComponent,
    handleWrapperClass,
    onResizeStop,
    size,
    style,
  }) => {
    mockResizeStop = onResizeStop;

    return (
      <div style={{ ...style, ...size }}>
        <div className={handleWrapperClass}>
          {Object.entries(handleComponent).map(([direction, handle]) => (
            <div key={direction}>{handle}</div>
          ))}
        </div>
        {children}
      </div>
    );
  },
}));

test("renders a horizontal handle", () => {
  render(<ResizableWithHandle handleDirection="bottom" />);
  expect(screen.getByTestId("horizontalHandle")).toBeTruthy();
});

test("renders a vertical handle", () => {
  render(<ResizableWithHandle handleDirection="right" />);
  expect(screen.getByTestId("verticalHandle")).toBeTruthy();
});

test("it does not add an incorrect class to the handle", () => {
  const { container } = render(
    <ResizableWithHandle handleDirection="bottom" />,
  );
  expect(
    container.getElementsByClassName("resizable-with-handle__handle--right")
      .length,
  ).toBe(0);
});

test("it adds the expected class to the handle", () => {
  const { container } = render(
    <ResizableWithHandle handleDirection="bottom" />,
  );
  expect(
    container.getElementsByClassName("resizable-with-handle__handle--bottom")
      .length,
  ).toBe(1);
});

test("persists the measured width after a horizontal resize", () => {
  const { container } = render(
    <ResizableWithHandle
      defaultWidth="50%"
      defaultHeight="100%"
      handleDirection="right"
    />,
  );

  act(() => {
    mockResizeStop(null, "right", {
      getBoundingClientRect: () => ({ width: 400, height: 300 }),
    });
  });

  expect(container.firstChild).toHaveStyle({
    width: "400px",
    height: "100%",
  });
});

test("persists the measured height after a vertical resize", () => {
  const { container } = render(
    <ResizableWithHandle
      defaultWidth="100%"
      defaultHeight="50%"
      handleDirection="bottom"
    />,
  );

  act(() => {
    mockResizeStop(null, "bottom", {
      getBoundingClientRect: () => ({ width: 400, height: 300 }),
    });
  });

  expect(container.firstChild).toHaveStyle({
    width: "100%",
    height: "300px",
  });
});
