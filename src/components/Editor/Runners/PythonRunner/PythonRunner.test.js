import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import PythonRunner from "./PythonRunner";
import { codeRunHandled, setError, triggerDraw } from "../../EditorSlice";

describe("Testing basic input span functionality", () => {
  let input;
  let store;

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: [
            {
              content: "input()"
            }
          ],
          image_list: []
        },
        codeRunTriggered: true,
      }
    }
    store = mockStore(initialState);
    render(<Provider store={store}><PythonRunner /></Provider>);
    input = document.getElementById("input");
  })

  test("Input function in code makes editable input box appear", () => {
    expect(input).toHaveAttribute("contentEditable", "true");
  })

  test("Input box has focus when it appears", () => {
    expect(input).toHaveFocus();
  })

  test("Clicking output pane transfers focus to input", () => {
    const outputPane = document.getElementsByClassName("pythonrunner-console")[0]
    fireEvent.click(outputPane);
    expect(input).toHaveFocus();
  })

  test("Pressing enter stops the input box being editable", () => {
    const inputText = 'hello world';
    input.innerText = inputText;
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 })

    expect(input).not.toHaveAttribute("contentEditable", "true");
    expect(input.innerText).toBe(inputText + '\n');
  })
})

test("Input box not there when input function not called", () => {
  const middlewares = []
  const mockStore = configureStore(middlewares)
  const initialState = {
    editor: {
      project: {
        components: [
          {
            content: "print('Hello')"
          }
        ],
        image_list: []
      },
      codeRunTriggered: true
    }
  }
  const store = mockStore(initialState);
  render(<Provider store={store}><PythonRunner /></Provider>);
  expect(document.getElementById("input")).toBeNull()

})

describe("Testing stopping the code run with input", () => {
  let store;
  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: [
            {
              content: "input()"
            }
          ],
          image_list: []
        },
        codeRunTriggered: true,
        codeRunStopped: true
      }
    }
    store = mockStore(initialState);
    render(<Provider store={store}><PythonRunner /></Provider>);
  })

  test("Disables input span", () => {
    expect(document.getElementById("input")).toBeNull();
  })

  test("Sets interruption error", () => {
    expect(store.getActions()).toEqual(expect.arrayContaining([setError('Execution interrupted')]))
  })

  test("Handles code run", () => {
    expect(store.getActions()).toEqual(expect.arrayContaining([codeRunHandled()]))
  })
})

describe('When not embedded, no visual libraries used and code run', () => {
  let store;
  let queryByText;
  
  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: [
            {
              content: "print('hello world')"
            }
          ],
          image_list: []
        },
        codeRunTriggered: true,
        isEmbedded: false
      }
    }
    store = mockStore(initialState);
    ({queryByText} = render(<Provider store={store}><PythonRunner /></Provider>));
  })

  test('Visual tab is not shown', () => {
    const visualTab = queryByText('Visual Output')
    expect(visualTab).not.toBeInTheDocument()
  })
})

describe('When not embedded, p5 imported and code run', () => {
  let store;
  let queryByText;
  
  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: [
            {
              content: "import p5"
            }
          ],
          image_list: []
        },
        codeRunTriggered: true,
        isEmbedded: false
      }
    }
    store = mockStore(initialState);
    ({queryByText} = render(<Provider store={store}><PythonRunner /></Provider>));
  })

  test('Visual tab is shown', () => {
    const visualTab = queryByText('Visual Output')
    expect(visualTab).toBeInTheDocument()
  })

  test('Draw is triggered', () => {
    expect(store.getActions()).toEqual(expect.arrayContaining([triggerDraw()]))
  })
})

describe('When not embedded, pygal imported and code run', () => {
  let store;
  let queryByText;
  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: [
            {
              content: "import pygal"
            }
          ],
          image_list: []
        },
        codeRunTriggered: true,
        isEmbedded: false
      }
    }
    store = mockStore(initialState);
    ({queryByText} = render(<Provider store={store}><PythonRunner /></Provider>));
  })

  test('Visual tab is shown', () => {
    const visualTab = queryByText('Visual Output')
    expect(visualTab).toBeInTheDocument()
  })
})

describe('When not embedded, turtle imported and code run', () => {
  let store;
  let queryByText;
  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: [
            {
              content: "import turtle"
            }
          ],
          image_list: []
        },
        codeRunTriggered: true,
        isEmbedded: false
      }
    }
    store = mockStore(initialState);
    ({queryByText} = render(<Provider store={store}><PythonRunner /></Provider>));
  })

  test('Visual tab is shown', () => {
    const visualTab = queryByText('Visual Output')
    expect(visualTab).toBeInTheDocument()
  })
})

describe('When not embedded, sense_hat imported and code run', () => {
  let store;
  let queryByText;
  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: [
            {
              content: "import _internal_sense_hat"
            }
          ],
          image_list: []
        },
        codeRunTriggered: true,
        isEmbedded: false
      }
    }
    store = mockStore(initialState);
    ({queryByText} = render(<Provider store={store}><PythonRunner /></Provider>));
  })

  test('Visual tab is shown', async () => {
    const visualTab = queryByText('Visual Output')
    expect(visualTab).toBeInTheDocument()  })
})

describe('When embedded, no visual libraries used and code run', () => {
  let store;
  let queryByText;
  
  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: [
            {
              content: "print('hello world')"
            }
          ],
          image_list: []
        },
        codeRunTriggered: true,
        isEmbedded: true
      }
    }
    store = mockStore(initialState);
    ({queryByText} = render(<Provider store={store}><PythonRunner /></Provider>));
  })

  test('Visual tab is not shown', () => {
    const visualTab = queryByText('Visual Output')
    expect(visualTab).not.toBeVisible()
  })
})

describe('When embedded, p5 imported and code run', () => {
  let store;
  let queryByText;
  
  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: [
            {
              content: "import p5"
            }
          ],
          image_list: []
        },
        codeRunTriggered: true,
        isEmbedded: true
      }
    }
    store = mockStore(initialState);
    ({queryByText} = render(<Provider store={store}><PythonRunner /></Provider>));
  })

  test('Visual tab is not hidden', () => {
    const visualTab = queryByText('Visual Output')
    expect(visualTab).toBeVisible()
  })

  test('Draw is triggered', () => {
    expect(store.getActions()).toEqual(expect.arrayContaining([triggerDraw()]))
  })
})

describe('When embedded, pygal imported and code run', () => {
  let store;
  let queryByText;
  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: [
            {
              content: "import pygal"
            }
          ],
          image_list: []
        },
        codeRunTriggered: true,
        isEmbedded: true
      }
    }
    store = mockStore(initialState);
    ({queryByText} = render(<Provider store={store}><PythonRunner /></Provider>));
  })

  test('Visual tab is not hidden', () => {
    const visualTab = queryByText('Visual Output')
    expect(visualTab).toBeVisible()
  })
})

describe('When embedded, turtle imported and code run', () => {
  let store;
  let queryByText;
  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: [
            {
              content: "import turtle"
            }
          ],
          image_list: []
        },
        codeRunTriggered: true,
        isEmbedded: true
      }
    }
    store = mockStore(initialState);
    ({queryByText} = render(<Provider store={store}><PythonRunner /></Provider>));
  })

  test('Visual tab is not hidden', () => {
    const visualTab = queryByText('Visual Output')
    expect(visualTab).toBeVisible()
  })
})

describe('When embedded, sense_hat imported and code run', () => {
  let store;
  let queryByText;
  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: [
            {
              content: "import _internal_sense_hat"
            }
          ],
          image_list: []
        },
        codeRunTriggered: true,
        isEmbedded: true
      }
    }
    store = mockStore(initialState);
    ({queryByText} = render(<Provider store={store}><PythonRunner /></Provider>));
  })

  test('Visual tab is not hidden', async () => {
    const visualTab = queryByText('Visual Output')
    expect(visualTab).toBeVisible()
  })
})
