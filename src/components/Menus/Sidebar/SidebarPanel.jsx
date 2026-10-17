import React, { useState } from "react";
import ResizableWithHandle from "../../../utils/ResizableWithHandle";
import classNames from "classnames";
import PropTypes from "prop-types";
import {
  MOBILE_MEDIA_QUERY,
  SMALL_SCREEN_MEDIA_QUERY,
} from "../../../utils/mediaQueryBreakpoints";
import { useMediaQuery } from "react-responsive";

const MIN_WIDTH = "280px";

const SidebarPanel = (props) => {
  const {
    children,
    heading,
    Footer,
    className,
    buttons,
    headerContent,
    headingPrefix,
    panelRef,
    defaultWidth = "320px",
  } = props;
  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });
  const [initialWidth] = useState(() =>
    window.matchMedia(SMALL_SCREEN_MEDIA_QUERY).matches
      ? MIN_WIDTH
      : defaultWidth,
  );

  const buttonsIsEmptyArray =
    buttons && Array.isArray(buttons) && buttons.length === 0;

  const panelContent = (
    <>
      <div className="sidebar__panel-header">
        <div className="sidebar__panel-heading-row">
          {headingPrefix}
          <h2 className="sidebar__panel-heading">{heading}</h2>
        </div>
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
  headingPrefix: PropTypes.node,
};

export default SidebarPanel;
