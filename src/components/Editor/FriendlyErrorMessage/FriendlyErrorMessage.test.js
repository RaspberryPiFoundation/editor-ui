import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { render, screen } from "@testing-library/react";
import FriendlyErrorMessage from "./FriendlyErrorMessage";

const middlewares = [];
const mockStore = configureStore(middlewares);

describe("When friendlyError is set", () => {
  beforeEach(() => {
    const initialState = {
      editor: {
        error: "An error occurred",
        friendlyError: {
          html: '<div class="pfem__title">Friendly Error Title</div><div class="pfem__summary">This is a more user-friendly explanation of the error.</div><div class="pfem__why">A variable created in another place might not be available here.</div><ul class="pfem__steps"><li>Move the line that makes it to above where you use it.</li><li>Or set it here just before you use it.</li></ul><pre class="pfem__patch">kettle = 0</pre><details class="pfem__details"><summary>Original error</summary><pre>An error occurred</pre></details>',
        },
      },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <FriendlyErrorMessage />
      </Provider>,
    );
  });

  test("Friendly error title and summary display", () => {
    expect(screen.getByText("Friendly Error Title")).toBeInTheDocument();
    expect(
      screen.getByText(
        "This is a more user-friendly explanation of the error.",
      ),
    ).toBeInTheDocument();
  });

  it("strips unsafe scripts", () => {
    const initialState = {
      editor: {
        error: "An error occurred",
        friendlyError: {
          html: `
                <div class="pfem__title">Friendly Error Title</div>
                <img src="x" onerror="alert('xss')" />
                <script>alert("xss")</script>
                <a href="javascript:alert('xss')">Bad link</a>
              `,
        },
      },
    };
    const store = mockStore(initialState);
    const { container } = render(
      <Provider store={store}>
        <FriendlyErrorMessage />
      </Provider>,
    );

    expect(container.querySelector("script")).not.toBeInTheDocument();
    expect(container.querySelector("[onerror]")).not.toBeInTheDocument();
    expect(
      container.querySelector('a[href^="javascript:"]'),
    ).not.toBeInTheDocument();
  });
});

describe("When friendlyError is not set", () => {
  beforeEach(() => {
    const initialState = {
      editor: {
        error: "Oops",
      },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <FriendlyErrorMessage />
      </Provider>,
    );
  });

  test("Does not display friendly error elements", () => {
    expect(
      document.querySelector(".friendly-error-message"),
    ).not.toBeInTheDocument();
  });
});
