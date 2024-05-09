import React from "react";
import { render, screen } from "@testing-library/react";
import Modal from "react-modal";

import MultiStepModal from "./MultiStepModal";
import Step1 from "../SchoolOnboarding/Step1";

describe("MultiStepModal", () => {
  const steps = [<Step1 />, <Step1 />, <Step1 />];

  beforeAll(() => {
    const root = global.document.createElement("div");
    root.setAttribute("id", "app");
    global.document.body.appendChild(root);
    Modal.setAppElement("#app");
  });

  beforeEach(() => {
    render(
      <MultiStepModal
        storageKey={"testData"}
        isOpen={true}
        withCloseButton={true}
        heading={"Title"}
        closeModal={() => {}}
        steps={steps}
        storeCurrentStep={false}
        onSubmit={(_currentStep, nextStep) => {
          nextStep();
        }}
      />,
    );
  });

  it("has the correct title", () => {
    expect(screen.queryByText("Title")).toBeInTheDocument();
  });

  it("does not show the current step", () => {
    expect(screen.queryByText("Step 1 of 1")).not.toBeInTheDocument();
  });

  it("shows the step title", () => {
    expect(
      screen.queryByText("schoolOnboarding.steps.step1.title"),
    ).toBeInTheDocument();
  });
});
