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

describe("When there is sense_hat output", () => {
  beforeEach(() => {
    const visuals = [
      {
        origin: "sense_hat",
        content: { colour: "#FF00A4" },
      },
    ];
    renderPaneWithVisuals(visuals);
  });

  test("it displays the current state of the sense hat", () => {
    expect(screen.queryByText(/#FF00A4/)).toBeInTheDocument();
  });
});

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
            props: new Map(Object.entries({ style: 'color: "red"' })),
          }),
        ),
      },
    ];
    renderPaneWithVisuals(visuals);
  });

  test("it renders the turtle output", () => {
    expect(screen.queryByText("hello world")).toBeInTheDocument();
  });

  test("it applies the attributes within turtle", () => {
    expect(screen.queryByText("hello world")).toHaveStyle('color: "red"');
  });
});

describe("When there is a matplotlib output", () => {
  beforeEach(() => {
    const visuals = [
      {
        origin: "matplotlib",
        content: [1, 2, 3, 4],
      },
    ];
    renderPaneWithVisuals(visuals);
  });

  test("it renders without crashing", () => {
    expect(document.getElementsByClassName("pythonrunner-graphic").length).toBe(
      1,
    );
  });

  test("it renders the jpg", () => {
    const jpg = screen.getByRole("img");
    const expectedSrc = `data:image/jpg;base64,${window.btoa(
      String.fromCharCode(...new Uint8Array([1, 2, 3, 4])),
    )}`;
    expect(jpg).toHaveAttribute("src", expectedSrc);
  });

  test("it resizes the jpg to fit into the available space", () => {
    const jpg = screen.getByRole("img");
    expect(jpg).toHaveStyle("max-width: 100%; max-height: 100%;");
  });
});

describe("When there is an unsupported origin", () => {
  test("it throws an error", () => {
    const visuals = [
      {
        origin: "unsupported",
        content: {},
      },
    ];
    expect(() => renderPaneWithVisuals(visuals)).toThrowError(
      "Unsupported origin: unsupported",
    );
  });
});

describe("When there are no visuals", () => {
  test("it renders without crashing", () => {
    renderPaneWithVisuals([]);
  });
});
