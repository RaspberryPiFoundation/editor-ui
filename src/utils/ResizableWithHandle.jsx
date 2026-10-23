import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Resizable } from "re-resizable";

import "../assets/stylesheets/ResizableWithHandle.scss?inline";

const VerticalHandle = () => (
  <span
    className="resizable-with-handle__indicator resizable-with-handle__indicator--vertical"
    data-testid="verticalHandle"
  />
);

const HorizontalHandle = () => (
  <span
    className="resizable-with-handle__indicator resizable-with-handle__indicator--horizontal"
    data-testid="horizontalHandle"
  />
);

const ResizableWithHandle = (props) => {
  const { children, defaultWidth, defaultHeight, handleDirection, ...rest } =
    props;
  const isInlineEndHandle = handleDirection === "inline-end";
  const resizeDirections = isInlineEndHandle ? ["right", "left"] : ["bottom"];

  const [width, setWidth] = useState("auto");
  const [height, setHeight] = useState("auto");

  useMemo(() => setWidth(defaultWidth), [defaultWidth]);
  useMemo(() => setHeight(defaultHeight), [defaultHeight]);

  const onResizeStop = (...[, direction, element]) => {
    const { width: nextWidth, height: nextHeight } =
      element.getBoundingClientRect();

    if (["left", "right"].includes(direction)) {
      setWidth(nextWidth);
    } else {
      setHeight(nextHeight);
    }
  };

  const handleComponent = Object.fromEntries(
    resizeDirections.map((direction) => [
      direction,
      isInlineEndHandle ? <VerticalHandle /> : <HorizontalHandle />,
    ]),
  );
  const handleClasses = Object.fromEntries(
    resizeDirections.map((direction) => [
      direction,
      `resizable-with-handle__handle--${direction}`,
    ]),
  );
  const enabledHandles = Object.fromEntries(
    resizeDirections.map((direction) => [direction, true]),
  );
  const handleWrapperClass = `resizable-with-handle__handle resizable-with-handle__handle--${handleDirection}`;

  return (
    <Resizable
      enable={{
        top: false,
        right: false,
        bottom: false,
        left: false,
        ...enabledHandles,
      }}
      handleClasses={handleClasses}
      handleComponent={handleComponent}
      handleWrapperClass={handleWrapperClass}
      onResizeStop={onResizeStop}
      size={{ width: width, height: height }}
      handleStyles={
        isInlineEndHandle
          ? {
              right: { height: "96%", top: "2%" },
              left: { height: "96%", top: "2%" },
            }
          : {}
      }
      {...rest}
    >
      {children}
    </Resizable>
  );
};

ResizableWithHandle.propTypes = {
  children: PropTypes.any.isRequired,
  defaultWidth: PropTypes.string,
  defaultHeight: PropTypes.string,
  handleDirection: PropTypes.oneOf(["inline-end", "block-end"]).isRequired,
};

export default ResizableWithHandle;
