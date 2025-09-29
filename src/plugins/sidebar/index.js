import {
  getRegisteredSidebarPluginFactories,
  registerSidebarPlugin,
} from "./registry";
import "./ExampleMarkdownSidebarPlugin.sidebar-plugin";

const seenExternalFactories = new WeakSet();

const ensureExternalPluginsRegistered = () => {
  if (typeof window === "undefined") {
    return;
  }

  const externalFactories = window.__EDITOR_SIDEBAR_PLUGINS__;

  if (!Array.isArray(externalFactories)) {
    return;
  }

  externalFactories
    .filter((factory) => typeof factory === "function")
    .forEach((factory) => {
      if (!seenExternalFactories.has(factory)) {
        seenExternalFactories.add(factory);
        registerSidebarPlugin(factory);
      }
    });
};

const normalizePluginOption = (option) => {
  if (!option || typeof option !== "object") {
    return null;
  }

  const { plugin = {}, ...rest } = option;
  const pluginId = plugin.id || option.name;

  return {
    ...rest,
    plugin: {
      ...plugin,
      id: pluginId,
    },
    isPlugin: true,
  };
};

export const collectSidebarPluginOptions = (context = {}) => {
  ensureExternalPluginsRegistered();

  const factories = getRegisteredSidebarPluginFactories();

  if (factories.length === 0) {
    return [];
  }

  const { requestedOptions = [] } = context;

  return factories.flatMap((factory) => {
    try {
      const result = factory(context);
      const options = Array.isArray(result) ? result : [result];

      return options
        .map(normalizePluginOption)
        .filter(Boolean)
        .filter((pluginOption) => {
          if (!pluginOption) {
            return false;
          }

          if (
            pluginOption.requireExplicitOption &&
            !requestedOptions.includes(pluginOption.name)
          ) {
            return false;
          }

          if (typeof pluginOption.shouldRender === "function") {
            try {
              return pluginOption.shouldRender(context) !== false;
            } catch (error) {
              if (process.env.NODE_ENV !== "production") {
                // eslint-disable-next-line no-console
                console.warn(
                  `[SidebarPlugins] Plugin '${pluginOption.name}' threw in shouldRender`,
                  error,
                );
              }
              return false;
            }
          }

          return true;
        });
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn(
          "[SidebarPlugins] Failed to execute sidebar plugin",
          error,
        );
      }

      return [];
    }
  });
};

export { registerSidebarPlugin };

if (typeof window !== "undefined" && !window.registerEditorSidebarPlugin) {
  window.registerEditorSidebarPlugin = registerSidebarPlugin;
}
