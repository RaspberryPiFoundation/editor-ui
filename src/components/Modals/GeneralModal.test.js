import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import GeneralModal from "./GeneralModal";

import "../../consoleMock";

const defaultCallback = jest.fn();
const closeModal = jest.fn();

describe("With close button", () => {
  beforeEach(() => {
    render(
      <div id="app">
        <GeneralModal
          isOpen={true}
          closeModal={closeModal}
          withCloseButton
          defaultCallback={defaultCallback}
          heading="My modal heading"
          text={[{ content: "Paragraph1", type: "paragraph" }]}
          buttons={[<button onClick={jest.fn()}>My amazing button</button>]}
        />
      </div>,
    );
  });

  test("Renders", () => {
    expect(screen.queryByText("My modal heading")).toBeInTheDocument();
    expect(screen.queryByText("Paragraph1")).toBeInTheDocument();
    expect(screen.queryByText("My amazing button")).toBeInTheDocument();
  });

  test("Clicking close button closes modal", () => {
    const closeButton = screen.queryByTitle("modals.close");
    fireEvent.click(closeButton);
    expect(closeModal).toHaveBeenCalled();
  });

  test("Pressing Enter calls the default callback", () => {
    const modal = screen.getByRole("dialog");
    fireEvent.keyDown(modal, { key: "Enter" });
    expect(defaultCallback).toHaveBeenCalled();
  });
});

describe("Without close button", () => {
  beforeEach(() => {
    render(
      <div id="app">
        <GeneralModal
          isOpen={true}
          closeModal={closeModal}
          withCloseButton={false}
          defaultCallback={defaultCallback}
          heading="My modal heading"
          text={[{ content: "Paragraph1", type: "paragraph" }]}
          buttons={[<button onClick={jest.fn()}>My amazing button</button>]}
        />
      </div>,
    );
  });

  test("Clicking close button closes modal", () => {
    const closeButton = screen.queryByTitle("modals.close");
    expect(closeButton).not.toBeInTheDocument();
  });
});
