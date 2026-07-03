export const isOwner = (user, project) => {
  return (
    user &&
    user.profile &&
    (user.profile.user === project.user_id || !project.identifier)
  );
};

const componentHasChanged = (component, initialComponent) =>
  component.content !== initialComponent.content ||
  component.name !== initialComponent.name ||
  component.extension !== initialComponent.extension;

export const projectHasChangedSinceInitialLoad = (
  project,
  initialComponents = null,
  { initialName, initialInstructions } = {},
) => {
  if (
    initialName !== undefined &&
    (project?.name ?? null) !== initialName
  ) {
    return true;
  }

  if (
    initialInstructions !== undefined &&
    (project?.instructions ?? null) !== initialInstructions
  ) {
    return true;
  }

  const currentComponents = project?.components;

  if (!Array.isArray(currentComponents) || !Array.isArray(initialComponents)) {
    return false;
  }

  if (currentComponents.length !== initialComponents.length) return true;

  return currentComponents.some((component, index) =>
    componentHasChanged(component, initialComponents[index]),
  );
};

const projectSnapshotFromProject = (project) => ({
  initialComponents: (project?.components || []).map((component) => ({
    name: component.name,
    extension: component.extension,
    content: component.content,
  })),
  initialProjectName: project?.name ?? null,
  initialProjectInstructions: project?.instructions ?? null,
});

export const syncInitialProjectSnapshot = (state, project) => {
  const snapshot = projectSnapshotFromProject(project);
  state.initialComponents = snapshot.initialComponents;
  state.initialProjectName = snapshot.initialProjectName;
  state.initialProjectInstructions = snapshot.initialProjectInstructions;
};
