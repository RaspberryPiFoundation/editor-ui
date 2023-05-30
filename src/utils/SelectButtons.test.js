import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import SelectButtons from "./SelectButtons";

const setValue = jest.fn();

beforeEach(() => {
  render(
    <SelectButtons
      label="choose an option"
      options={[
        { value: "value1", label: "label1", Icon: () => {} },
        { value: "value2", label: "label2", Icon: () => {} },
      ]}
      value="value1"
      setValue={setValue}
    />,
  );
});

test("Question and buttons render", () => {
  expect(screen.queryByText("choose an option")).toBeInTheDocument();
  expect(screen.queryByText("label1")).toBeInTheDocument();
  expect(screen.queryByText("label2")).toBeInTheDocument();
});

test("Clicking an option calls the setValue function", () => {
  const option2 = screen.getByText("label2");
  fireEvent.click(option2);
  expect(setValue).toHaveBeenCalledWith("value2");
});
