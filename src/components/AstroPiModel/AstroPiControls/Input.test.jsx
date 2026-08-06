import React from "react";
import { render } from "@testing-library/react";
import Input from "./Input";
import Sk from "skulpt";

let inputComponent;

beforeEach(() => {
  Sk.sense_hat = {};
  inputComponent = render(
    <Input name="foo" label="bar" type="color" defaultValue="#e01010" />,
  );
});

test("Renders as expected", () => {
  expect(inputComponent.queryByText(/bar/)).not.toBeNull();
});

test("Creates input of correct type", () => {
  expect(inputComponent.queryByLabelText(/bar/)).toHaveAttribute(
    "type",
    "color",
  );
});

test("Creates input with correct value", () => {
  expect(inputComponent.queryByLabelText(/bar/)).toHaveAttribute(
    "value",
    "#e01010",
  );
});

test("Sets skulpt value correctly", () => {
  expect(Sk.sense_hat.foo).toEqual("#e01010");
});
