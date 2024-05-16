import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { BrowserRouter } from "react-router-dom";
import MembersPageHeader from "./MembersPageHeader";

import * as userRoleHelper from "../../../utils/userRoleHelper";
jest.mock("../../../utils/userRoleHelper");
const mockStore = configureStore([]);

describe("MembersPageHeader", () => {
  describe("When the user is a school owner", () => {
    test("Renders the invite teachers button", () => {
      userRoleHelper.isSchoolOwner.mockReturnValue(true);
      const store = mockStore({
        auth: {
          user: {
            profile: { roles: "school-owner" },
          },
        },
      });

      render(
        <Provider store={store}>
          <BrowserRouter>
            <MembersPageHeader />
          </BrowserRouter>
        </Provider>,
      );

      expect(
        screen.queryByText("membersPageHeader.invite"),
      ).toBeInTheDocument();
    });
  });
});
