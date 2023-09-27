import React from "react";
import ResizableWithHandle from "../../../utils/ResizableWithHandle";
import classNames from "classnames";
import PropTypes from "prop-types";
import { MOBILE_MEDIA_QUERY } from "../../../utils/mediaQueryBreakpoints";
import { useMediaQuery } from "react-responsive";

const SidebarPanel = (props) => {
  const { children, heading, className, Button } = props;
  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });

  const panelContent = (
    <>
      <div className="sidebar__panel-header">
        <h2 className="sidebar__panel-heading">{heading}</h2>
        {Button ? <Button /> : null}
      </div>

      <div className="sidebar__panel-content">{children}</div>
    </>
  );

  return isMobile ? (
    <div
      data-testid="sidebar__panel"
      className={classNames("sidebar__panel", className)}
    >
      {panelContent}
    </div>
  ) : (
    <ResizableWithHandle
      data-testid="sidebar__panel"
      className={classNames("sidebar__panel", className)}
      defaultWidth="225px"
      defaultHeight="100%"
      handleDirection="right"
      minWidth="180px"
      maxWidth="300px"
    >
      {panelContent}
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
