const registeredSidebarPlugins = [];
const registeredFactories = new WeakSet();

export const registerSidebarPlugin = (factory) => {
  if (typeof factory !== "function" || registeredFactories.has(factory)) {
    return;
  }

  registeredFactories.add(factory);
  registeredSidebarPlugins.push(factory);
};

export const getRegisteredSidebarPluginFactories = () => [
  ...registeredSidebarPlugins,
];
