import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import SchoolOnboarding from "./SchoolOnboarding";
import { MemoryRouter } from "react-router-dom";
import useSchool from "../../hooks/useSchool";
import { login } from "../../utils/login";

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

    it("it attempts to load up the school", () => {
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

    it("it loads up the school", () => {
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

    it("it loads up the school", () => {
      expect(useSchool).toHaveBeenCalledWith({ accessToken: "1234" });
    });

    test("it renders the school already exists view", () => {
      expect(
        screen.queryByText("schoolAlreadyExists.title"),
      ).toBeInTheDocument();
    });
  });
});
