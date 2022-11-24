import reducer, {
  stopCodeRun,
  showRenameFileModal,
  closeRenameFileModal
} from "./EditorSlice";

test("Action stopCodeRun sets codeRunStopped to true", () => {
  const previousState = {
    codeRunTriggered: true,
    codeRunStopped: false
  };
  const expectedState = {
    codeRunTriggered: true,
    codeRunStopped: true
  }
  expect(reducer(previousState, stopCodeRun())).toEqual(expectedState)
})

test("Showing modal sets file state and showing status", () => {
  const previousState = {
    renameFileModalShowing: false,
    modals: {},
    error: 'some error'
  }
  const expectedState = {
    renameFileModalShowing: true,
    modals: {
      renameFile: {
        name: 'main',
        ext: '.py',
        fileKey: 0
      }
    },
    error: ''
  }
  expect(reducer(previousState, showRenameFileModal({name: 'main', ext: '.py', fileKey: 0}))).toEqual(expectedState)
})

test("closing modal updates showing status", () => {
  const previousState = {
    renameFileModalShowing: true,
    modals: {
      renameFile: {
        name: 'main',
        ext: '.py',
        fileKey: 0
      }
    }
  }
  const expectedState = {
    renameFileModalShowing: false,
    modals: {
      renameFile: {
        name: 'main',
        ext: '.py',
        fileKey: 0
      }
    }
  }
  expect(reducer(previousState, closeRenameFileModal())).toEqual(expectedState)
})
