import React, { useMemo } from "react";
import { marked } from "marked";

import SidebarPanel from "../../components/Menus/Sidebar/SidebarPanel";
import InfoIcon from "../../assets/icons/info.svg";
import { registerSidebarPlugin } from "./registry";

const MARKDOWN_CONTENT = `# Plugin example: Markdown notes

This panel is supplied by an external plugin. It renders markdown so you can:

- jot down quick notes
- share onboarding tips
- prototype new sidebar experiences

> Replace this content with anything you like to trial sidebar extensions.
`;

const ExampleMarkdownPanel = ({ isMobile }) => {
  const htmlContent = useMemo(() => marked.parse(MARKDOWN_CONTENT), []);

  return (
    <SidebarPanel
      heading="Example Markdown"
      className="sidebar__panel--plugin"
      pluginId="example-markdown-plugin"
      defaultWidth={isMobile ? "100%" : "260px"}
    >
      <div
        className="sidebar-plugin-markdown"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </SidebarPanel>
  );
};

registerSidebarPlugin(() => {
  const name = "exampleMarkdown";

  return {
    name,
    icon: InfoIcon,
    title: "Example Markdown",
    position: "top",
    panel: ExampleMarkdownPanel,
    plugin: {
      id: "example-markdown-plugin",
      description: "Displays placeholder markdown rendered via marked",
    },
  };
});

export default ExampleMarkdownPanel;
