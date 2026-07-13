import {
  hasProjectChangedForAutoSave,
  isAutoSaveBlocked,
  isEligibleForAutoSave,
} from "./autoSaveLogic";

const projectAuthor = {
  profile: { user: "author-id" },
};

const project = {
  identifier: "my-project",
  user_id: "author-id",
  name: "hello",
  components: [{ name: "main", extension: "py", content: "# hi" }],
};

describe("autoSaveLogic", () => {
  test("isEligibleForAutoSave requires matching user and saved project identifier", () => {
    expect(isEligibleForAutoSave(projectAuthor, project)).toBe(true);
    expect(
      isEligibleForAutoSave(projectAuthor, { ...project, identifier: null }),
    ).toBe(false);
    expect(
      isEligibleForAutoSave({ profile: { user: "other-id" } }, project),
    ).toBe(false);
  });

  test("isAutoSaveBlocked covers run, in-flight, and redux pending", () => {
    expect(
      isAutoSaveBlocked({
        codeRunInProgress: false,
        inFlight: false,
        saving: "idle",
      }),
    ).toBe(false);

    expect(
      isAutoSaveBlocked({
        codeRunInProgress: true,
        inFlight: false,
        saving: "idle",
      }),
    ).toBe(true);

    expect(
      isAutoSaveBlocked({
        codeRunInProgress: false,
        inFlight: true,
        saving: "idle",
      }),
    ).toBe(true);

    expect(
      isAutoSaveBlocked({
        codeRunInProgress: false,
        inFlight: false,
        saving: "pending",
      }),
    ).toBe(true);
  });

  test("hasProjectChangedForAutoSave compares against initial snapshot", () => {
    const initialComponents = project.components.map((component) => ({
      ...component,
    }));

    expect(
      hasProjectChangedForAutoSave(project, initialComponents, {
        initialName: project.name,
      }),
    ).toBe(false);

    expect(
      hasProjectChangedForAutoSave(
        {
          ...project,
          components: [{ ...project.components[0], content: "# edited" }],
        },
        initialComponents,
        { initialName: project.name },
      ),
    ).toBe(true);
  });
});
