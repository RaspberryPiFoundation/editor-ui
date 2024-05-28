import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { act } from "react-dom/test-utils";
import MultiStepForm from "./MultistepForm";
import Step1 from "../SchoolOnboarding/Step1";
import Step2 from "../SchoolOnboarding/Step2";
import Step3 from "../SchoolOnboarding/Step3";

jest.mock("../../utils/apiCallHandler");

const mockStore = configureStore([]);
const accessToken = "1234";
const initialState = {
  auth: {
    user: {
      access_token: accessToken,
    },
  },
};
const store = mockStore(initialState);

describe("When localStorage is empty", () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <MultiStepForm
          storageKey={"schoolOnboarding"}
          steps={[
            <Step1 />,
            <Step2 stepIsValid={jest.fn} showInvalidFields={true} />,
            <Step3 />,
          ]}
          checkValidation={() => []}
          onSubmit={() => []}
        />
      </Provider>,
    );
  });

  test("it default to step 1", () => {
    expect(
      screen.queryByText("schoolOnboarding.steps.step1.title"),
    ).toBeInTheDocument();
  });

  test("it renders a next button", () => {
    expect(screen.queryByText("multiStepForm.continue")).toBeInTheDocument();
  });

  test("it renders a cancel button", () => {
    expect(screen.queryByText("multiStepForm.cancel")).toBeInTheDocument();
  });

  test("clicking next takes you to step 2", async () => {
    act(() => {
      screen.getByText("multiStepForm.continue").click();
    });
    await waitFor(() =>
      expect(
        screen.queryByText("schoolOnboarding.steps.step2.title"),
      ).toBeInTheDocument(),
    );
  });
});

describe("When there is a step in localStorage", () => {
  beforeEach(() => {
    localStorage.setItem(
      "schoolOnboarding",
      JSON.stringify({ currentStep: 1 }),
    );
    render(
      <Provider store={store}>
        <MultiStepForm
          storageKey={"schoolOnboarding"}
          steps={[
            <Step1 />,
            <Step2 stepIsValid={jest.fn} showInvalidFields={true} />,
            <Step3 />,
          ]}
          checkValidation={() => true}
          onSubmit={() => []}
        />
      </Provider>,
    );
  });

  test("it renders the step from localStorage", async () => {
    await waitFor(() =>
      expect(
        screen.queryByText("schoolOnboarding.steps.step2.title"),
      ).toBeInTheDocument(),
    );
  });

  test("it renders a previous button", async () => {
    await waitFor(() =>
      expect(screen.queryByText("multiStepForm.back")).toBeInTheDocument(),
    );
  });

  test("clicking previous takes you to the previous step", async () => {
    act(() => {
      screen.getByText("multiStepForm.back").click();
    });
    await waitFor(() =>
      expect(
        screen.queryByText("schoolOnboarding.steps.step1.title"),
      ).toBeInTheDocument(),
    );
  });
});

afterEach(() => {
  localStorage.removeItem("schoolOnboarding");
});
