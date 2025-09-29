# Sidebar plugin architecture

This README explains the sidebar plugin system that was introduced to let the editor load additional sidebar buttons and panels at runtime. It summarises the core building blocks, how the new wiring fits together, and shows how to add a plugin either inside the bundle or from an embedding host page.

> **TL;DR** – Sidebar plugins are lightweight factories that return menu option definitions. They register themselves once, and the sidebar picks them up automatically when it builds its option list.

---

## Key moving parts

| Area | Purpose | Relevant files |
| --- | --- | --- |
| Plugin registry | Keeps a list of registered factories and guards against duplicate registration. | `src/plugins/sidebar/registry.js` |
| Plugin loader | Normalises plugin contributions, merges them into the sidebar option list, and exposes helpers for host pages. | `src/plugins/sidebar/index.js` |
| Sidebar integration | Calls the loader each render to gather plugin options and deduplicate them against the built-ins. | `src/components/Menus/Sidebar/Sidebar.jsx` |
| UI plumbing | Adds `data-plugin-id` hooks to buttons and panels, and extends styling for plugin content. | `SidebarBar.jsx`, `SidebarBarOption.jsx`, `SidebarPanel.jsx`, `src/assets/stylesheets/Sidebar.scss` |
| Example plugin | Demonstrates markdown rendering via a plugin-provided panel. | `src/plugins/sidebar/ExampleMarkdownSidebarPlugin.sidebar-plugin.js` |

### Runtime flow

1. **Registration** – Each plugin exports a factory function and registers it with `registerSidebarPlugin(factory)`. The example plugin does this when its module is imported. Host pages can also register factories globally (see below).
2. **Collection** – Whenever the sidebar renders, it calls `collectSidebarPluginOptions(context)`. This executes every registered factory, passing runtime context such as `requestedOptions`, `isMobile`, and instruction metadata.
3. **Normalisation** – Factory results are coerced into menu option objects, plugin IDs are enforced, `shouldRender` hooks are honoured, and duplicate names are ignored.
4. **Rendering** – The merged option list reaches `SidebarBar` and `SidebarPanel`. Buttons and panels carry `data-plugin-id="<id>"`, and plugins can override headings, icons, widths, etc.

---

## Plugin factory contract

A factory receives a single context object and should return **either** a single option **or** an array of options. Each option is the same shape used by core menu entries:

```ts
export type SidebarPluginOption = {
  name: string;                 // unique key used for routing & dedupe
  title: string;                // tooltip / accessible label
  icon?: React.ComponentType;   // SVG React component for the sidebar button
  position: "top" | "bottom";  // group to slot into
  panel: React.ComponentType;   // React component rendered when active
  plugin?: {
    id?: string;                // data-plugin-id and analytics handle
    description?: string;       // free-form metadata
    [key: string]: unknown;     // any extra metadata you need
  };
  requireExplicitOption?: boolean; // honour host-provided allow list
  shouldRender?: (context) => boolean | void; // return false to skip
};
```

Best practices:

- Always supply a stable `name`. Names collide with the core menu (`file`, `images`, etc.), so choose a unique slug.
- Provide a `plugin.id` if you want deterministic CSS/analytics hooks. Missing IDs fall back to the option name.
- Use `shouldRender` for expensive checks (permissions, data availability). Throwing errors is caught and logged in development.
- Respect `requireExplicitOption` if your plugin should opt-in via the host `sidebarOptions` prop; this keeps the default experience untouched.

---

## Example: Markdown plugin walk-through

`src/plugins/sidebar/ExampleMarkdownSidebarPlugin.sidebar-plugin.js` ships with the bundle and demonstrates everything end-to-end:

1. **Content** – Uses `marked` to convert a short markdown string into HTML.
2. **Panel** – Wraps the HTML in the shared `SidebarPanel` component, applying `sidebar__panel--plugin` for styling and passing its plugin ID.
3. **Registration** – Calls `registerSidebarPlugin(() => ({ ... }))` where the factory returns the option metadata (`name`, `title`, `icon`, `panel`, etc.).
4. **Result** – The sidebar renders an “Example Markdown” button in the top group and displays the markdown output, complete with plugin styling.

You can use this example as a starting point for your own plugin – copy it, rename the identifiers, and swap in your panel logic.

---

## Creating a new plugin inside the repository

1. **Create your panel component**
   - Build a React component that renders the UI you need. Most plugins will render inside `SidebarPanel` for consistent heading/resize behaviour.
   - Accept the props you care about; the sidebar forwards `isMobile` by default.

2. **Register the plugin**
   - Place a new file under `src/plugins/sidebar/` (e.g., `MyFeature.sidebar-plugin.js`).
   - Import `registerSidebarPlugin` and call it with your factory function.
   - Return a `SidebarPluginOption` object (or an array) from the factory.

3. **Expose the module**
   - Ensure your module is imported from `src/plugins/sidebar/index.js` so that the side effect runs when the bundle initialises.
   - Optionally add tests or stories in the same folder.

4. **Add styling (optional)**
   - Target `data-plugin-id="my-plugin"` or use shared utility classes such as `sidebar__panel--plugin`.
   - Add SCSS rules under `src/assets/stylesheets/Sidebar.scss` or a dedicated stylesheet if the styling is substantial.

5. **Test**
   - Add or update unit tests under `src/components/Menus/Sidebar/` to ensure the button appears and the panel renders.
   - Run `yarn test Sidebar` (or a narrower pattern) to catch regressions.

6. **Ship metadata**
   - Populate `plugin.description` or any custom fields you need for analytics/telemetry.

---

## Loading plugins from an embedding host

Hosts that embed the editor can register plugins without bundling code into this repo:

### Register before the editor loads

```html
<script>
  window.__EDITOR_SIDEBAR_PLUGINS__ = [
    () => ({
      name: "hostProvided",
      title: "Host panel",
      icon: null, // supply an inline SVG string/component when available
      position: "bottom",
      panel: HostPanel, // your React component exposed to the page
    }),
  ];
</script>
```

### Register after the editor loads

The bundle exposes a helper for late registration:

```js
window.registerEditorSidebarPlugin(() => ({
  name: "dynamic",
  title: "Dynamic panel",
  icon: null, // supply an inline SVG string/component when available
  position: "top",
  panel: DynamicPanel,
}));
```

> **Note:** Factories added at runtime run immediately on the next render, so you can lazily inject features when a user opts in.

---

## Styling and UX guidelines

- Use headings, spacing, and scrollbar conventions from `SidebarPanel` to match first-party panels.
- Keep button icons monochrome to follow the existing visual language. Inline SVG React components work best.
- When a plugin needs a footer (actions, help links), pass a footer component via the `Footer` prop on `SidebarPanel`.
- Use `className="sidebar__panel--plugin"` for baseline theming, then extend in SCSS if you need more.

---

## Testing and troubleshooting

- **Unit tests** – See `SidebarBarOption.test.js` and `SidebarPanel.test.js` for examples that assert plugin hooks and data attributes.
- **Development logging** – Any exception thrown by `shouldRender` is caught and logged in development builds, preventing a bad plugin from breaking the sidebar.
- **Name collisions** – If two options share the same `name`, the built-in entry wins and subsequent plugins are ignored. Choose unique names.
- **Opt-in behaviour** – Respect `requireExplicitOption` for experimental features so that hosts can turn them on explicitly via the `sidebarOptions` prop.

---

## Related docs

- `docs/SidebarPlugins.md` – Concise quick-start reference.
- `src/plugins/sidebar/ExampleMarkdownSidebarPlugin.sidebar-plugin.js` – Ready-made example plugin.
- `src/components/Menus/Sidebar/Sidebar.jsx` – Shows how plugins are merged with built-in options.

If you run into issues or want to extend the system (priority ordering, lazy loading, etc.), open an issue or drop a note in the architecture channel so we can iterate further.
