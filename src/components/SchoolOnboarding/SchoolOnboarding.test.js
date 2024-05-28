import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import SchoolOnboarding from "./SchoolOnboarding";
import { MemoryRouter } from "react-router-dom";
import useSchool from "../../hooks/useSchool";
import { login } from "../../utils/login";

import { createSchool } from "../../utils/apiCallHandler";

jest.mock("../../utils/apiCallHandler");
jest.mock("../../utils/login");
jest.mock("../../hooks/useSchool", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const middlewares = [];
const mockStore = configureStore(middlewares);

const renderSchoolOnboarding = ({ school, user }) => {
  const store = mockStore({ school, auth: { user } });

  render(
    <Provider store={store}>
      <MemoryRouter>
        <div id="app">
          <SchoolOnboarding />
        </div>
      </MemoryRouter>
    </Provider>,
  );
};

describe("When not logged in", () => {
  beforeEach(() => {
    renderSchoolOnboarding({ school: {} });
  });

  test("it redirects to login", () => {
    expect(login).toHaveBeenCalled();
  });

  test("it does not render the school onboarding page", () => {
    const title = screen.queryByText("schoolOnboarding.title_1");
    expect(title).not.toBeInTheDocument();
  });
});

describe("When logged in", () => {
  describe("When the user doesn't have a school", () => {
    beforeEach(() => {
      renderSchoolOnboarding({
        school: { loading: false },
        user: { access_token: "1234" },
      });
    });

    it("does not redirect to login", () => {
      expect(login).not.toHaveBeenCalled();
    });

    it("attempts to load up the school", () => {
      expect(useSchool).toHaveBeenCalledWith({ accessToken: "1234" });
    });

    test("it renders the school onboarding form", () => {
      expect(screen.queryByText("Step 1 of 4")).toBeInTheDocument();
    });
  });

  describe("When the user's school is unverified", () => {
    beforeEach(() => {
      renderSchoolOnboarding({
        school: { loading: false, id: 1, verified_at: null },
        user: { access_token: "1234" },
      });
    });

    it("loads up the school", () => {
      expect(useSchool).toHaveBeenCalledWith({ accessToken: "1234" });
    });

    test("it renders the school being verified view", () => {
      expect(
        screen.queryByText("schoolBeingVerified.title"),
      ).toBeInTheDocument();
    });
  });

  describe("When the user's school is verified", () => {
    beforeEach(() => {
      renderSchoolOnboarding({
        school: { loading: false, id: 1, verified_at: "2021-01-01" },
        user: { access_token: "1234" },
      });
    });

    it("loads up the school", () => {
      expect(useSchool).toHaveBeenCalledWith({ accessToken: "1234" });
    });

    test("it renders the school already exists view", () => {
      expect(
        screen.queryByText("schoolAlreadyExists.title"),
      ).toBeInTheDocument();
    });
  });

  describe("When the user is on the final step of the form", () => {
    const step_2 = {
      creator_agree_authority: true,
      creator_agree_terms_and_conditions: true,
    };
    const step_3 = {
      creator_role: "teacher",
      creator_role_other: "",
      creator_department: "Drama",
    };
    const step_4 = {
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

    describe("When the user's role is not 'other'", () => {
      beforeEach(() => {
        localStorage.setItem(
          "schoolOnboarding",
          JSON.stringify({ currentStep: 3, step_2, step_3, step_4 }),
        );

        renderSchoolOnboarding({
          school: { loading: false },
          user: { access_token: "1234" },
        });
      });

      test("it renders the school onboarding form", () => {
        expect(screen.queryByText("Step 4 of 4")).toBeInTheDocument();
      });

      test("it renders a submit button", () => {
        expect(screen.getByText("multiStepForm.submit")).toBeInTheDocument();
      });

      test("clicking submit makes a school creation request", () => {
        screen.getByText("multiStepForm.submit").click();
        expect(createSchool).toHaveBeenCalledWith(
          {
            ...step_2,
            creator_role: "teacher",
            creator_department: "Drama",
            ...step_4,
          },
          "1234",
        );
      });

      test("clears localStorage after successful school creation", async () => {
        createSchool.mockImplementationOnce(() =>
          Promise.resolve({
            status: 201,
          }),
        );
        screen.getByText("multiStepForm.submit").click();
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
        screen.getByText("multiStepForm.submit").click();
        await waitFor(() =>
          expect(screen.queryByText("schoolCreated.title")).toBeInTheDocument(),
        );
      });
    });

    describe("When the user's role is set to 'other'", () => {
      const step_3 = {
        creator_role: "other",
        creator_role_other: "parent",
        creator_department: "Drama",
      };

      beforeEach(() => {
        localStorage.setItem(
          "schoolOnboarding",
          JSON.stringify({ currentStep: 3, step_2, step_3, step_4 }),
        );

        renderSchoolOnboarding({
          school: { loading: false },
          user: { access_token: "1234" },
        });
      });

      test("it sends creator_role_other as the creator_role", () => {
        screen.getByText("multiStepForm.submit").click();
        expect(createSchool).toHaveBeenCalledWith(
          {
            ...step_2,
            creator_role: "parent",
            creator_department: "Drama",
            ...step_4,
          },
          "1234",
        );
      });
    });
  });
});
