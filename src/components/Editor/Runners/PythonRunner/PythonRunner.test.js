import React from "react";
import { fireEvent, render, screen } from "@testing-library/react"
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
    expect(store.getActions()).toEqual(expect.arrayContaining([setError('output.errors.interrupted')]))
  })

  test("Handles code run", () => {
    expect(store.getActions()).toEqual(expect.arrayContaining([codeRunHandled()]))
  })
})

describe('When in split view, no visual libraries used and code run', () => {
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
        isSplitView: true
      }
    }
    store = mockStore(initialState);
    ({queryByText} = render(<Provider store={store}><PythonRunner /></Provider>));
  })

  test('Visual tab is not shown', () => {
    const visualTab = queryByText('output.visualOutput')
    expect(visualTab).not.toBeInTheDocument()
  })
})

describe('When in split view, py5 imported and code run', () => {
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
              content: "import py5"
            }
          ],
          image_list: []
        },
        codeRunTriggered: true,
        isSplitView: true
      }
    }
    store = mockStore(initialState);
    ({queryByText} = render(<Provider store={store}><PythonRunner /></Provider>));
  })

  test('Visual tab is shown', () => {
    const visualTab = queryByText('output.visualOutput')
    expect(visualTab).toBeInTheDocument()
  })

  test('Draw is triggered', () => {
    expect(store.getActions()).toEqual(expect.arrayContaining([triggerDraw()]))
  })
})

describe('When in split view, pygal imported and code run', () => {
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
        isSplitView: true
      }
    }
    store = mockStore(initialState);
    ({queryByText} = render(<Provider store={store}><PythonRunner /></Provider>));
  })

  test('Visual tab is shown', () => {
    const visualTab = queryByText('output.visualOutput')
    expect(visualTab).toBeInTheDocument()
  })
})

describe('When in split view, turtle imported and code run', () => {
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
        isSplitView: true
      }
    }
    store = mockStore(initialState);
    ({queryByText} = render(<Provider store={store}><PythonRunner /></Provider>));
  })

  test('Visual tab is shown', () => {
    const visualTab = queryByText('output.visualOutput')
    expect(visualTab).toBeInTheDocument()
  })
})

describe('When in split view, sense_hat imported and code run', () => {
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
        isSplitView: true
      }
    }
    store = mockStore(initialState);
    ({queryByText} = render(<Provider store={store}><PythonRunner /></Provider>));
  })

  test('Visual tab is shown', async () => {
    const visualTab = queryByText('output.visualOutput')
    expect(visualTab).toBeInTheDocument()  })
})

describe('When in tabbed view, no visual libraries used and code run', () => {
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
        isSplitView: false
      }
    }
    store = mockStore(initialState);
    ({queryByText} = render(<Provider store={store}><PythonRunner /></Provider>));
  })

  test('Visual tab is not shown', () => {
    const visualTab = queryByText('output.visualOutput')
    expect(visualTab).not.toBeInTheDocument()
  })
})

describe('When in tabbed view, py5 imported and code run', () => {
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
              content: "import py5"
            }
          ],
          image_list: []
        },
        codeRunTriggered: true,
        isSplitView: false
      }
    }
    store = mockStore(initialState);
    ({queryByText} = render(<Provider store={store}><PythonRunner /></Provider>));
  })

  test('Visual tab is not hidden', () => {
    const visualTab = queryByText('output.visualOutput')
    expect(visualTab).toBeInTheDocument()
  })

  test('Draw is triggered', () => {
    expect(store.getActions()).toEqual(expect.arrayContaining([triggerDraw()]))
  })
})

describe('When in tabbed view, pygal imported and code run', () => {
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
        isSplitView: false
      }
    }
    store = mockStore(initialState);
    ({queryByText} = render(<Provider store={store}><PythonRunner /></Provider>));
  })

  test('Visual tab is not hidden', () => {
    const visualTab = queryByText('output.visualOutput')
    expect(visualTab).toBeInTheDocument()
  })
})

describe('When in tabbed view, turtle imported and code run', () => {
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
        isSplitView: false
      }
    }
    store = mockStore(initialState);
    ({queryByText} = render(<Provider store={store}><PythonRunner /></Provider>));
  })

  test('Visual tab is not hidden', () => {
    const visualTab = queryByText('output.visualOutput')
    expect(visualTab).toBeInTheDocument()
  })
})

describe('When in tabbed view, sense_hat imported and code run', () => {
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
        isSplitView: false
      }
    }
    store = mockStore(initialState);
    ({queryByText} = render(<Provider store={store}><PythonRunner /></Provider>));
  })

  test('Visual tab is not hidden', async () => {
    const visualTab = queryByText('output.visualOutput')
    expect(visualTab).toBeInTheDocument()
  })
})

test("When embedded in split view with visual output does not render output view toggle", () => {
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
        },
        codeRUnTriggered: true,
        isSplitView: true,
        isEmbedded: true
      }
    }
    const store = mockStore(initialState);
    render(<Provider store={store}><PythonRunner /></Provider>)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

test("When embedded in split view with no visual output does not render output view toggle", () => {
  const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {},
        senseHatAlwaysEnabled: false,
        isSplitView: true,
        isEmbedded: true
      }
    }
    const store = mockStore(initialState);
    render(<Provider store={store}><PythonRunner /></Provider>)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

test("When embedded in tabbed view does not render output view toggle", () => {
  const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {},
        isSplitView: false,
        isEmbedded: true
      }
    }
    const store = mockStore(initialState);
    render(<Provider store={store}><PythonRunner /></Provider>)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

test('Tabbed view has text and visual tabs with same parent element', () => {
  const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {},
        senseHatAlwaysEnabled: true,
        isSplitView: false
      }
    }
    const store = mockStore(initialState);
    render(<Provider store={store}><PythonRunner /></Provider>)
    expect(screen.getByText('output.visualOutput').parentElement.parentElement).toEqual(screen.getByText('output.textOutput').parentElement.parentElement)
})

test('Split view has text and visual tabs with different parent elements', () => {
  const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {},
        senseHatAlwaysEnabled: true,
        isSplitView: true
      }
    }
    const store = mockStore(initialState);
    render(<Provider store={store}><PythonRunner /></Provider>)
    expect(screen.getByText('output.visualOutput').parentElement).not.toEqual(screen.getByText('output.textOutput').parentElement)
})
