import { createContext } from "react";

export const getSidebarTabId = (name) => `sidebar-tab-${name}`;
export const getSidebarPanelId = (name) => `sidebar-panel-${name}`;

// Name of the sidebar option whose panel is currently rendered,
// so the panel can be labelled by its tab.
export const SidebarActiveOptionContext = createContext(null);
