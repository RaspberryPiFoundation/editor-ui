import {
  hasOwnerProjectChanged,
  isEligibleForOwnerAutoSave,
  isOwnerAutoSaveBlocked,
} from "./ownerAutoSaveLogic";

const owner = {
  profile: { user: "owner-id" },
};

const project = {
  identifier: "my-project",
  user_id: "owner-id",
  name: "hello",
  components: [{ name: "main", extension: "py", content: "# hi" }],
};

describe("ownerAutoSaveLogic", () => {
  test("isEligibleForOwnerAutoSave requires owner and identifier", () => {
    expect(isEligibleForOwnerAutoSave(owner, project)).toBe(true);
    expect(
      isEligibleForOwnerAutoSave(owner, { ...project, identifier: null }),
    ).toBe(false);
    expect(
      isEligibleForOwnerAutoSave({ profile: { user: "other-id" } }, project),
    ).toBe(false);
  });

  test("isOwnerAutoSaveBlocked covers run, in-flight, and redux pending", () => {
    expect(
      isOwnerAutoSaveBlocked({
        codeRunInProgress: false,
        inFlight: false,
        saving: "idle",
      }),
    ).toBe(false);

    expect(
      isOwnerAutoSaveBlocked({
        codeRunInProgress: true,
        inFlight: false,
        saving: "idle",
      }),
    ).toBe(true);

    expect(
      isOwnerAutoSaveBlocked({
        codeRunInProgress: false,
        inFlight: true,
        saving: "idle",
      }),
    ).toBe(true);

    expect(
      isOwnerAutoSaveBlocked({
        codeRunInProgress: false,
        inFlight: false,
        saving: "pending",
      }),
    ).toBe(true);
  });

  test("hasOwnerProjectChanged compares against initial snapshot", () => {
    const initialComponents = project.components.map((component) => ({
      ...component,
    }));

    expect(
      hasOwnerProjectChanged(project, initialComponents, {
        initialName: project.name,
      }),
    ).toBe(false);

    expect(
      hasOwnerProjectChanged(
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
