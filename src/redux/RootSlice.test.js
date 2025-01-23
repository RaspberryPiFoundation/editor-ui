import reducer, { resetStore } from "./RootSlice";
import { editorInitialState } from "./EditorSlice";
import { instructionsInitialState } from "./InstructionsSlice";

test("Action reset store clears the project data", () => {
  const previousState = {
    editor: {
      ...editorInitialState,
      project: {
        components: [
          { name: "main", extension: "py", content: "print('hello world')" },
        ],
      },
    },
    instructions: instructionsInitialState,
  };

  expect(reducer(previousState, resetStore())).toEqual({
    editor: editorInitialState,
    instructions: instructionsInitialState,
  });
});

test("Action reset store clears the instructions data", () => {
  const previousState = {
    editor: editorInitialState,
    instructions: {
      ...instructionsInitialState,
      project: {
        steps: [{ content: "<p>step 0</p>" }],
      },
    },
  };

  expect(reducer(previousState, resetStore())).toEqual({
    editor: editorInitialState,
    instructions: instructionsInitialState,
  });
});

test("Action reset store does not clear the auth data", () => {
  const previousState = {
    editor: editorInitialState,
    instructions: instructionsInitialState,
    auth: {
      user: { access_token: "1234" },
    },
  };

  expect(reducer(previousState, resetStore())).toEqual({
    editor: editorInitialState,
    instructions: instructionsInitialState,
    auth: {
      user: { access_token: "1234" },
    },
  });
});
