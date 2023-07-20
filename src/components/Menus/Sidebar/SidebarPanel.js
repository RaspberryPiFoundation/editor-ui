import React from "react";
import ResizableWithHandle from "../../../utils/ResizableWithHandle";
import classNames from "classnames";
import PropTypes from "prop-types";

const SidebarPanel = (props) => {
  const { children, heading, className, Button } = props;

  return (
    <ResizableWithHandle
      data-testid="sidebar__panel"
      className={classNames("sidebar__panel", className)}
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

SidebarPanel.propTypes = {
  children: PropTypes.any.isRequired,
  heading: PropTypes.string.isRequired,
  className: PropTypes.string,
  Button: PropTypes.func,
};

export default SidebarPanel;
