import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import InfoPanel from "./InfoPanel";

describe("Info panel", () => {
  let queryByText;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
              extension: "py",
            },
          ],
          link_list: [
            {
              text: "Feedback",
              url: "/feedback",
            },
            {
              text: "Privacy",
              url: "/privacy",
            },
          ],
        },
      },
    };
    const store = mockStore(initialState);
    ({ queryByText } = render(
      <Provider store={store}>
        <InfoPanel />
      </Provider>
    ));
  });

  test("Links are rendered", () => {
    expect(queryByText("Feedback")).not.toBeNull();
    expect(queryByText("Privacy")).not.toBeNull();
  });

  test("Links have the expected source", () => {
    expect(queryByText("feedback")).toHaveAttribute("href", "feedback_url");
  });
});
