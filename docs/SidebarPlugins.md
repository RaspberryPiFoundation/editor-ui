# Sidebar plugin system

The sidebar supports runtime plugins that can add new buttons and panels alongside the built-in options (files, images, instructions, etc.). This makes it possible to experiment with new tooling without modifying the core sidebar components.

## Core concepts

- **Plugin factory** – A function that returns a sidebar option definition `{ name, title, icon, position, panel, plugin }`. Factories run with a context object that provides runtime state (for example `requestedOptions`, `isMobile`, `instructionsSteps`).
- **Registry** – Factories register themselves through `registerSidebarPlugin`. The registry exposes the contributions to the sidebar through `collectSidebarPluginOptions`.
- **Plugin metadata** – The optional `plugin` property can carry an `id` and arbitrary metadata. The sidebar propagates the `id` to rendered DOM nodes via the `data-plugin-id` attribute for analytics and styling hooks.

## Registering a plugin inside the bundle

Create a module that registers your plugin when it is imported:

```js
import { registerSidebarPlugin } from "../../plugins/sidebar";
import MyIcon from "../../assets/icons/info.svg";
import SidebarPanel from "../../components/Menus/Sidebar/SidebarPanel";

const MyPanel = () => (
  <SidebarPanel heading="My custom panel" pluginId="my-plugin">
    <p>Hello from a plugin!</p>
  </SidebarPanel>
);

registerSidebarPlugin(() => ({
  name: "myPlugin",
  title: "My Plugin",
  icon: MyIcon,
  position: "bottom",
  panel: MyPanel,
  plugin: { id: "my-plugin" },
}));
```

Include the module somewhere under `src/plugins/sidebar` so that the bundle picks it up (for example import it from `src/plugins/sidebar/index.js`).

## Registering plugins from the host page

External hosts can push factory functions onto a global array before the editor loads:

```html
<script>
  window.__EDITOR_SIDEBAR_PLUGINS__ = [
    () => ({
      name: "hostProvided",
      title: "Host panel",
  icon: null, // supply an inline SVG string/component when available
      position: "bottom",
      panel: (props) => /* return React element here */, // via CDN/ESM build
    }),
  ];
</script>
```

Alternatively, once the bundle has loaded you can call the helper that is attached to `window`:

```js
window.registerEditorSidebarPlugin(() => ({
  name: "dynamic",
  title: "Dynamic panel",
  icon: null, // supply an inline SVG string/component when available
  position: "top",
  panel: DynamicPanel,
}));
```

## Styling hooks

- Use `data-plugin-id="<plugin-id>"` to target both the sidebar button wrapper and the panel container.
- Apply the `sidebar__panel--plugin` class (or add your own) to inherit plugin-specific styling such as the markdown example shipped in `src/plugins/sidebar/ExampleMarkdownSidebarPlugin.sidebar-plugin.js`.

## Testing

- Unit tests for plugin-capable components live under `src/components/Menus/Sidebar/`.
- Add targeted tests for new plugins so they don’t regress silently.
