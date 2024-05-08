import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import SchoolDashboard from "./SchoolDashboard";
import { getSchool } from "../../utils/apiCallHandler";

jest.mock("../../utils/apiCallHandler");

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    identifier: "school-id",
  }),
}));

describe("School", () => {
  const mockStore = configureStore([]);

  const renderSchool = (store) => {
    render(
      <Provider store={store}>
        <SchoolDashboard />
      </Provider>,
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
    const store = mockStore({
      auth: { user: { access_token: "access-token" } },
    });

    test("display that the school is loading", () => {
      renderSchool(store);
      expect(screen.queryByText("Loading")).toBeInTheDocument();
    });

    test("requests the school from the API", () => {
      renderSchool(store);
      expect(getSchool).toHaveBeenCalledWith("school-id", "access-token");
    });

    test("when the user isn't authorised to see the school", async () => {
      getSchool.mockImplementationOnce(() =>
        Promise.reject({ response: { status: 403 } }),
      );

      renderSchool(store);
      expect(await screen.findByText("Not authorised")).toBeInTheDocument();
    });

    test("when the school isn't found", async () => {
      getSchool.mockImplementationOnce(() =>
        Promise.reject({ response: { status: 404 } }),
      );

      renderSchool(store);
      expect(await screen.findByText("School not found")).toBeInTheDocument();
    });

    test("when the school has loaded", async () => {
      getSchool.mockImplementationOnce(() =>
        Promise.resolve({ name: "school-name" }),
      );

      renderSchool(store);
      expect(await screen.findByText("school-name")).toBeInTheDocument();
    });
  });
});
