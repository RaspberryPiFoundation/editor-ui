import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import Modal from "react-modal";
import GeneralModal from "./GeneralModal";

const defaultCallback = jest.fn();
const closeModal = jest.fn();

beforeAll(() => {
  const root = global.document.createElement("div");
  root.setAttribute("id", "app");
  global.document.body.appendChild(root);
  Modal.setAppElement("#app");
});

describe("With close button", () => {
  beforeEach(() => {
    render(
      <GeneralModal
        isOpen={true}
        closeModal={closeModal}
        withCloseButton
        defaultCallback={defaultCallback}
        heading="My modal heading"
        text={[{ content: "Paragraph1", type: "paragraph" }]}
        buttons={[
          <button key="button" onClick={jest.fn()}>
            My amazing button
          </button>,
        ]}
      />,
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
    const modal = screen.getByRole("dialog", { hidden: true });
    fireEvent.keyDown(modal, { key: "Enter" });
    expect(defaultCallback).toHaveBeenCalled();
  });
});

describe("Without close button", () => {
  beforeEach(() => {
    render(
      <GeneralModal
        isOpen={true}
        closeModal={closeModal}
        withCloseButton={false}
        defaultCallback={defaultCallback}
        heading="My modal heading"
        text={[{ content: "Paragraph1", type: "paragraph" }]}
        buttons={[
          <button key="button" onClick={jest.fn()}>
            My amazing button
          </button>,
        ]}
      />,
    );
  });

  test("Clicking close button closes modal", () => {
    const closeButton = screen.queryByTitle("modals.close");
    expect(closeButton).not.toBeInTheDocument();
  });
});
