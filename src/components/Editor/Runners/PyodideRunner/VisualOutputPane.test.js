import { render, screen } from "@testing-library/react";
import configureStore from "redux-mock-store";

import { Provider } from "react-redux";
import VisualOutputPane from "./VisualOutputPane.jsx";
import Highcharts from "highcharts";

jest.mock("highcharts");

const renderPaneWithVisuals = (visuals) => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      project: {},
    },
    auth: {},
  };
  const store = mockStore(initialState);
  render(
    <Provider store={store}>
      <VisualOutputPane visuals={visuals} setVisuals={(f) => f(visuals)} />
    </Provider>,
  );
};

// describe("When there is sense_hat output", () => {

// });

describe("When there is pygal output", () => {
  beforeEach(() => {
    const visuals = [
      {
        origin: "pygal",
        content: { chart: { events: { load: () => {} } } },
      },
    ];
    renderPaneWithVisuals(visuals);
  });

  test("it renders without crashing", () => {
    expect(document.getElementsByClassName("pythonrunner-graphic").length).toBe(
      1,
    );
  });

  test("it displays the chart", () => {
    expect(Highcharts.chart).toHaveBeenCalled();
  });
});

describe("When there is turtle output", () => {
  beforeEach(() => {
    const visuals = [
      {
        origin: "turtle",
        content: new Map(
          Object.entries({
            tag: "p",
            children: [new Map(Object.entries({ text: "hello world" }))],
            props: [],
          }),
        ),
      },
    ];
    renderPaneWithVisuals(visuals);
  });

  test("it renders the turtle output", () => {
    expect(screen.queryByText("hello world")).toBeInTheDocument();
  });
});
