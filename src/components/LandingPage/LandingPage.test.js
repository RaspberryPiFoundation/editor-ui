import React from "react";

import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

import LandingPage from "./LandingPage";

let container;

describe("<LandingPage>", () => {
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {},
        modals: {},
      },
      auth: {
        user: null,
      },
    };
    const store = mockStore(initialState);
    ({ container } = render(
      <MemoryRouter initialEntries={["/my_project"]}>
        <Provider store={store}>
          <LandingPage />
        </Provider>
      </MemoryRouter>,
    ));
  });

  test("LandingPage renders", () => {
    expect(
      container.getElementsByClassName("landing-page-wrapper"),
    ).toHaveLength(1);
  });

  test("Links to blank projects", () => {
    const starterProjectLinks = container.getElementsByClassName(
      "landing-page__button",
    );
    expect(starterProjectLinks).toHaveLength(2);
    expect(starterProjectLinks[0]).toHaveAttribute(
      "href",
      "/ja-JP/projects/blank-python-starter",
    );
    expect(starterProjectLinks[1]).toHaveAttribute(
      "href",
      "/ja-JP/projects/blank-html-starter",
    );
  });

  test("Login button renders", () => {
    expect(container.textContent).toContain("landingPage.login");
  });

  test("Links to Project site", () => {
    const descriptionLinks =
      container.getElementsByClassName("landing-page__link");
    expect(descriptionLinks).toHaveLength(2);
    expect(descriptionLinks[0]).toHaveAttribute(
      "href",
      "https://projects.raspberrypi.org/en/pathways/python-intro",
    );
    expect(descriptionLinks[1]).toHaveAttribute(
      "href",
      "https://projects.raspberrypi.org/en/pathways/web-intro",
    );
  });
});
