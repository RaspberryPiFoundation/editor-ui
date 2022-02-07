import reducer, { codeRunHandled, stopCodeRun } from "./EditorSlice";

test("Action codeRunStopped sets codeRunStopped to true", () => {
    const previousState = {
        codeRunTriggered: true,
        codeRunStopped: false
    };
    const expectedState = {
        codeRunTriggered: true,
        codeRunStopped: true
    }
    expect(reducer(previousState, stopCodeRun())).toEqual(expectedState);
})

