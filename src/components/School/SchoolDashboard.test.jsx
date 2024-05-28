import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import SchoolDashboard from "./SchoolDashboard";
import useSchool from "../../hooks/useSchool";
import { BrowserRouter } from "react-router-dom";

jest.mock("../../utils/apiCallHandler");

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    identifier: "school-id",
  }),
}));

jest.mock("../../hooks/useSchool", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("SchoolDashboard", () => {
  const mockStore = configureStore([]);

  const renderSchool = (store) => {
    render(
      <BrowserRouter>
        <Provider store={store}>
          <SchoolDashboard />
        </Provider>
      </BrowserRouter>,
    );
  };

  describe("when the user isn't logged in", () => {
    const store = mockStore({ auth: {} });

    test("display that they aren't logged in", () => {
      renderSchool(store);
      expect(screen.queryByText("Not logged in")).toBeInTheDocument();
    });
  });

  describe("when the user is logged in", () => {
    const auth = {
      user: {
        access_token: "access-token",
        profile: { roles: "" },
      },
    };

    describe("Before the school has started loading", () => {
      test("requests the school from the API", () => {
        const store = mockStore({ auth, school: {} });
        renderSchool(store);
        expect(useSchool).toHaveBeenCalledWith({
          id: "school-id",
          accessToken: "access-token",
        });
      });
    });

    describe("When the school is loading", () => {
      beforeEach(() => {
        const school = { loading: true };
        const store = mockStore({ auth, school });
        renderSchool(store);
      });

      test("display that the school is loading", () => {
        expect(screen.queryByText("Loading")).toBeInTheDocument();
      });
    });

    describe("When the school fails to load", () => {
      beforeEach(() => {
        const school = { error: {} };
        const store = mockStore({ auth, school });
        renderSchool(store);
      });

      test("Displays error message", () => {
        expect(screen.queryByText("Error loading school")).toBeInTheDocument();
      });
    });

    describe("When the school has loaded", () => {
      beforeEach(() => {
        const school = { name: "school-name" };
        const store = mockStore({ auth, school });
        renderSchool(store);
      });

      test("Displays school name", () => {
        expect(screen.queryByText("school-name")).toBeInTheDocument();
      });
    });
  });

  describe("When the user is a school owner", () => {
    const auth = {
      user: {
        access_token: "access-token",
        profile: { roles: "school-owner" },
      },
    };
    beforeEach(() => {
      const school = { name: "school-name", id: "school-id" };
      const store = mockStore({ auth, school });
      renderSchool(store);
    });

    test("Renders the manage members button", () => {
      expect(
        screen.queryByText("schoolDashboard.manageMembers"),
      ).toBeInTheDocument();
    });

    test("Does not render log out button", () => {
      expect(
        screen.queryByText("globalNav.accountMenu.logout"),
      ).not.toBeInTheDocument();
    });
  });

  describe("When the user is a school teacher", () => {
    const auth = {
      user: {
        access_token: "access-token",
        profile: { roles: "school-teacher" },
      },
    };
    beforeEach(() => {
      const school = { name: "school-name", id: "school-id" };
      const store = mockStore({ auth, school });
      renderSchool(store);
    });

    test("Renders the manage members button", () => {
      expect(
        screen.queryByText("schoolDashboard.manageMembers"),
      ).toBeInTheDocument();
    });

    test("Does not render log out button", () => {
      expect(
        screen.queryByText("globalNav.accountMenu.logout"),
      ).not.toBeInTheDocument();
    });
  });

  describe("When the user is a school student", () => {
    const auth = {
      user: {
        access_token: "access-token",
        profile: { roles: "school-student" },
      },
    };
    beforeEach(() => {
      const school = { name: "school-name", id: "school-id" };
      const store = mockStore({ auth, school });
      renderSchool(store);
    });

    test("Does not render the manage members button", () => {
      expect(
        screen.queryByText("schoolDashboard.manageMembers"),
      ).not.toBeInTheDocument();
    });

    test("Renders the log out button", () => {
      expect(
        screen.queryByText("globalNav.accountMenu.logout"),
      ).toBeInTheDocument();
    });
  });
});
