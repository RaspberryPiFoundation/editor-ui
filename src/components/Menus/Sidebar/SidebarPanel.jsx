import React, { useContext, useState } from "react";
import ResizableWithHandle from "../../../utils/ResizableWithHandle";
import { useSelector } from "react-redux";
import classNames from "classnames";
import PropTypes from "prop-types";
import { MOBILE_MEDIA_QUERY } from "../../../utils/mediaQueryBreakpoints";
import { useMediaQuery } from "react-responsive";
import {
  SidebarActiveOptionContext,
  getSidebarPanelId,
  getSidebarTabId,
} from "./sidebarTabIds";

const MIN_WIDTH = "280px";

export const SMALL_SIDEBAR_PROJECT_TYPE_BREAKPOINTS = {
  code_editor_scratch: "(max-width: 1430px)",
};

export const SMALL_SIDEBAR_PROJECT_TYPE = "(max-width: 1146px)";

export const sidebarStartingWidth = (projectType, defaultWidth) => {
  const breakpoint =
    SMALL_SIDEBAR_PROJECT_TYPE_BREAKPOINTS[projectType] ||
    SMALL_SIDEBAR_PROJECT_TYPE;

  return window.matchMedia(breakpoint).matches ? MIN_WIDTH : defaultWidth;
};

const SidebarPanel = (props) => {
  const {
    children,
    heading,
    Footer,
    className,
    buttons,
    headerContent,
    panelRef,
    defaultWidth = "320px",
  } = props;
  const projectType = useSelector((state) => state.editor.project.project_type);
  const activeOption = useContext(SidebarActiveOptionContext);
  const tabpanelProps = activeOption
    ? {
        role: "tabpanel",
        id: getSidebarPanelId(activeOption),
        "aria-labelledby": getSidebarTabId(activeOption),
        tabIndex: 0,
      }
    : {};
  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });
  const [initialWidth] = useState(
    sidebarStartingWidth(projectType, defaultWidth),
  );

  const buttonsIsEmptyArray =
    buttons && Array.isArray(buttons) && buttons.length === 0;

  const panelContent = (
    <>
      <div className="sidebar__panel-header">
        <h2 className="sidebar__panel-heading">{heading}</h2>
        {buttons && !buttonsIsEmptyArray && (
          <div className="sidebar__panel-buttons">{buttons}</div>
        )}
        {headerContent}
      </div>
      <div ref={panelRef} className="sidebar__panel-content">
        {children}
      </div>
      {Footer && <div className="sidebar__panel-footer">{<Footer />}</div>}
    </>
  );

  return isMobile ? (
    <div
      data-testid="sidebar__panel"
      className={classNames("sidebar__panel", className)}
      {...tabpanelProps}
    >
      {panelContent}
    </div>
  ) : (
    <ResizableWithHandle
      data-testid="sidebar__panel"
      className={classNames("sidebar__panel", className)}
      defaultWidth={initialWidth}
      defaultHeight="100%"
      handleDirection="right"
      minWidth={MIN_WIDTH}
      maxWidth="600px"
      {...tabpanelProps}
    >
      {panelContent}
    </ResizableWithHandle>
  );
};

SidebarPanel.propTypes = {
  children: PropTypes.any.isRequired,
  heading: PropTypes.string.isRequired,
  className: PropTypes.string,
  buttons: PropTypes.arrayOf(PropTypes.node),
  headerContent: PropTypes.node,
};

export default SidebarPanel;
