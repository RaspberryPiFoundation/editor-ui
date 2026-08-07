# Hosting `<editor-wc>`

Guides for apps that embed the editor web component. These pages describe the
host-facing APIs on `<editor-wc>` itself - what to call, when, and how - in
plain JavaScript and HTML. React hosts can use the same APIs; where helpful we
point at real usage in `editor-standalone`.

For mounting, attributes, events, and styling, start with the
[README](../../README.md#usage) and
[Web Component notes](../WebComponent.md).

## Host APIs

| Guide | What it covers |
| --- | --- |
| [Sidebar plugins](SidebarPlugins.md) | Add a host-owned panel (and optional header buttons) to the editor sidebar |
| [Autosave flush](AutosaveFlush.md) | Force-save dirty work before SPA or page navigation leaves the editor |
