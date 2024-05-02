import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { act } from "react-dom/test-utils";
import MultiStepForm from "./MultistepForm";
import { createSchool } from "../../utils/apiCallHandler";

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
        <MultiStepForm />
      </Provider>,
    );
  });

  test("it default to step 1", () => {
    expect(
      screen.queryByText("schoolOnboarding.steps.step1.title"),
    ).toBeInTheDocument();
  });

  test("it renders a next button", () => {
    expect(screen.queryByText("schoolOnboarding.continue")).toBeInTheDocument();
  });

  test("it renders a cancel button", () => {
    expect(screen.queryByText("schoolOnboarding.cancel")).toBeInTheDocument();
  });

  test("clicking next takes you to step 2", async () => {
    act(() => {
      screen.getByText("schoolOnboarding.continue").click();
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
      JSON.stringify({ currentStep: 2 }),
    );
    render(
      <Provider store={store}>
        <MultiStepForm />
      </Provider>,
    );
  });

  test("it renders the step from localStorage", async () => {
    await waitFor(() =>
      expect(
        screen.queryByText("schoolOnboarding.steps.step3.title"),
      ).toBeInTheDocument(),
    );
  });

  test("it renders a previous button", async () => {
    await waitFor(() =>
      expect(screen.queryByText("schoolOnboarding.back")).toBeInTheDocument(),
    );
  });

  test("clicking previous takes you to the previous step", async () => {
    act(() => {
      screen.getByText("schoolOnboarding.back").click();
    });
    await waitFor(() =>
      expect(
        screen.queryByText("schoolOnboarding.steps.step2.title"),
      ).toBeInTheDocument(),
    );
  });
});

describe("When on the last step", () => {
  const school = {
    name: "Raspberry Pi School of Drama",
    website: "https://www.schoolofdrama.org",
    address_line_1: "123 Drama Street",
    address_line_2: "Dramaville",
    municipality: "Drama City",
    administrative_area: "Dramashire",
    postal_code: "DR1 4MA",
    country_code: "GB",
    reference: "dr4m45ch001",
  };
  beforeEach(() => {
    localStorage.setItem(
      "schoolOnboarding",
      JSON.stringify({ currentStep: 3, step_4: school }),
    );
    render(
      <Provider store={store}>
        <MultiStepForm />
      </Provider>,
    );
  });

  test("it renders a submit button", async () => {
    await waitFor(() =>
      expect(screen.queryByText("schoolOnboarding.submit")).toBeInTheDocument(),
    );
  });

  test("clicking submit makes a school creation request", () => {
    screen.getByText("schoolOnboarding.submit").click();
    expect(createSchool).toHaveBeenCalledWith(school, accessToken);
  });

  test("clears localStorage after successful school creation", async () => {
    createSchool.mockImplementationOnce(() =>
      Promise.resolve({
        status: 201,
      }),
    );
    screen.getByText("schoolOnboarding.submit").click();
    await waitFor(() =>
      expect(localStorage.getItem("schoolOnboarding")).toBeNull(),
    );
  });

  test("it goes to the school created page after successful school creation", async () => {
    createSchool.mockImplementationOnce(() =>
      Promise.resolve({
        status: 201,
      }),
    );
    screen.getByText("schoolOnboarding.submit").click();
    await waitFor(() =>
      expect(screen.queryByText("schoolCreated.title")).toBeInTheDocument(),
    );
  });
});

afterEach(() => {
  localStorage.removeItem("schoolOnboarding");
});
