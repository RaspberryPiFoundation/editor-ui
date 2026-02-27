import React from "react";
import ResizableWithHandle from "../../../utils/ResizableWithHandle";
import classNames from "classnames";
import PropTypes from "prop-types";
import { MOBILE_MEDIA_QUERY } from "../../../utils/mediaQueryBreakpoints";
import { useMediaQuery } from "react-responsive";

const SidebarPanel = (props) => {
  const {
    children,
    heading,
    Footer,
    className,
    buttons,
    panelRef,
    defaultWidth = "320px",
  } = props;
  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });

  const buttonsIsEmptyArray =
    buttons && Array.isArray(buttons) && buttons.length === 0;

  const panelContent = (
    <>
      <div className="sidebar__panel-header">
        <h2 className="sidebar__panel-heading">{heading}</h2>
        {buttons && !buttonsIsEmptyArray && (
          <div className="sidebar__panel-buttons">{buttons}</div>
        )}
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
      className={classNames(
        "sidebar__panel",
        className,
        Footer && "sidebar__panel--with-footer",
      )}
    >
      {panelContent}
    </div>
  ) : (
    <ResizableWithHandle
      data-testid="sidebar__panel"
      className={classNames(
        "sidebar__panel",
        className,
        Footer && "sidebar__panel--with-footer",
      )}
      defaultWidth={defaultWidth}
      defaultHeight="100%"
      handleDirection="right"
      minWidth="280px"
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
};

export default SidebarPanel;
