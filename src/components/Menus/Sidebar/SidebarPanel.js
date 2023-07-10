import React from "react";
import ResizableWithHandle from "../../../utils/ResizableWithHandle";

const SidebarPanel = (props) => {
  const { children, heading, Button } = props;

  return (
    <ResizableWithHandle
      data-testid="sidebar__panel"
      className="sidebar__panel"
      defaultWidth="225px"
      defaultHeight="100%"
      handleDirection="right"
      minWidth="150px"
      maxWidth="300px"
    >
      <div className="sidebar__panel-header">
        <h2 className="sidebar__panel-heading">{heading}</h2>
        {Button ? <Button /> : null}
      </div>

      <div className="sidebar__panel-content">{children}</div>
    </ResizableWithHandle>
  );
};

export default SidebarPanel;
