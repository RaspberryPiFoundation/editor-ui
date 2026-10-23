import React from "react";
import { act, render, screen } from "@testing-library/react";
import ResizableWithHandle from "./ResizableWithHandle";

let mockResizeStop;
let mockResizableProps;

vi.mock("re-resizable", () => ({
  Resizable: ({
    children,
    handleClasses,
    handleComponent,
    handleWrapperClass,
    onResizeStop,
    size,
    style,
    ...props
  }) => {
    mockResizeStop = onResizeStop;
    mockResizableProps = props;

    return (
      <div style={{ ...style, ...size }}>
        <div className={handleWrapperClass}>
          {Object.entries(handleComponent).map(([direction, handle]) => (
            <div className={handleClasses[direction]} key={direction}>
              {handle}
            </div>
          ))}
        </div>
        {children}
      </div>
    );
  },
}));

test("renders a horizontal handle indicator", () => {
  render(<ResizableWithHandle handleDirection="block-end" />);
  expect(screen.getByTestId("horizontalHandle")).toHaveClass(
    "resizable-with-handle__indicator--horizontal",
  );
});

test("renders vertical handle indicators for both physical edges", () => {
  render(<ResizableWithHandle handleDirection="inline-end" />);

  expect(screen.getAllByTestId("verticalHandle")).toHaveLength(2);
  screen.getAllByTestId("verticalHandle").forEach((handle) => {
    expect(handle).toHaveClass("resizable-with-handle__indicator--vertical");
  });
});

test("it does not add an incorrect class to the handle", () => {
  const { container } = render(
    <ResizableWithHandle handleDirection="block-end" />,
  );
  expect(
    container.getElementsByClassName(
      "resizable-with-handle__handle--inline-end",
    ).length,
  ).toBe(0);
});

test("it adds the expected class to the handle", () => {
  const { container } = render(
    <ResizableWithHandle handleDirection="block-end" />,
  );
  expect(
    container.getElementsByClassName("resizable-with-handle__handle--block-end")
      .length,
  ).toBe(1);
});

test("provides both physical resize edges for an inline end handle", () => {
  const { container } = render(
    <ResizableWithHandle handleDirection="inline-end" />,
  );

  expect(mockResizableProps.enable).toMatchObject({
    right: true,
    left: true,
  });
  expect(
    container.getElementsByClassName("resizable-with-handle__handle--right"),
  ).toHaveLength(1);
  expect(
    container.getElementsByClassName("resizable-with-handle__handle--left"),
  ).toHaveLength(1);
});

test("persists the measured width after a horizontal resize", () => {
  const { container } = render(
    <ResizableWithHandle
      defaultWidth="50%"
      defaultHeight="100%"
      handleDirection="inline-end"
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
      handleDirection="block-end"
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
