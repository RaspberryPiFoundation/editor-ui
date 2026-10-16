import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Resizable } from "re-resizable";

import "../assets/stylesheets/ResizableWithHandle.scss?inline";

const VerticalHandle = () => (
  <svg
    data-testid="verticalHandle"
    width="16"
    height="56"
    viewBox="0 0 16 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" width="4" height="56" rx="2" fill="#616575" />
  </svg>
);

const HorizontalHandle = () => (
  <svg
    data-testid="horizontalHandle"
    width="56"
    height="16"
    viewBox="0 0 56 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="56"
      y="2"
      width="4"
      height="56"
      rx="2"
      transform="rotate(90 56 2)"
      fill="#616575"
    />
  </svg>
);

const ResizableWithHandle = (props) => {
  const { children, defaultWidth, defaultHeight, handleDirection, ...rest } =
    props;

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

  let handleComponent = ["right", "left"].includes(handleDirection)
    ? { [handleDirection]: <VerticalHandle /> }
    : ["top", "bottom"].includes(handleDirection)
      ? { [handleDirection]: <HorizontalHandle /> }
      : {};

  let handleWrapperClass = `resizable-with-handle__handle resizable-with-handle__handle--${handleDirection}`;

  return (
    <Resizable
      enable={{
        top: false,
        right: false,
        bottom: false,
        left: false,
        ...{ [handleDirection]: true },
      }}
      handleComponent={handleComponent}
      handleWrapperClass={handleWrapperClass}
      onResizeStop={onResizeStop}
      size={{ width: width, height: height }}
      handleStyles={{
        right: { height: "96%", top: "2%" },
      }}
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
  handleDirection: PropTypes.oneOf(["right", "left", "top", "bottom"])
    .isRequired,
};

export default ResizableWithHandle;
