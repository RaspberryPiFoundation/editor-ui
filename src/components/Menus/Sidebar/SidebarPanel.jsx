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
    buttons = [],
    defaultWidth = "225px",
  } = props;
  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });

  const buttonNodes = React.Children.toArray(buttons);

  const panelContent = (
    <>
      <div className="sidebar__panel-header">
        <h2 className="sidebar__panel-heading">{heading}</h2>
        {buttonNodes.length > 0 && (
          <div className="sidebar__panel-buttons">{buttonNodes}</div>
        )}
      </div>
      <div className="sidebar__panel-content">{children}</div>
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
      minWidth="180px"
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
  buttons: PropTypes.arrayOf(PropTypes.object),
};

export default SidebarPanel;
