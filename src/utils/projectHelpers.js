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
) => {
  const currentComponents = project?.components;

  if (!Array.isArray(currentComponents) || !Array.isArray(initialComponents)) {
    return false;
  }

  if (currentComponents.length !== initialComponents.length) return true;

  return currentComponents.some((component, index) =>
    componentHasChanged(component, initialComponents[index]),
  );
};
