import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Resizable } from 're-resizable';

import './ResizableWithHandle.scss';

const VerticalHandle = () => (
  <svg width="44" height="56" viewBox="0 0 44 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" width="4" height="56" rx="2" fill="#616575" />
  </svg>
);

const HorizontalHandle = () => (
  <svg width="56" height="44" viewBox="0 0 56 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="56" y="20" width="4" height="56" rx="2" transform="rotate(90 56 20)" fill="#616575"/>
  </svg>
);

const ResizableWithHandle = props => {
  const {children, defaultWidth, defaultHeight, handleDirection, ...rest} = props;

  const [width, setWidth] = useState('auto');
  const [height, setHeight] = useState('auto');

  useEffect(() => setWidth(defaultWidth), [defaultWidth]);
  useEffect(() => setHeight(defaultHeight), [defaultHeight]);

  const onResizeStop = (...[,,, d]) => {
    setWidth(width + d.width);
    setHeight(height + d.height);
  };

  let handleComponent = ['right', 'left'].includes(handleDirection) ? { [handleDirection]: <VerticalHandle /> } :
      (['top', 'bottom'].includes(handleDirection) ? { [handleDirection]: <HorizontalHandle /> } : {});

  let handleWrapperClass = `resizable-with-handle__handle resizable-with-handle__handle--${handleDirection}`;

  return (
    <Resizable
      enable={{ top: false, right: false, bottom: false, left: false, ...{[handleDirection]: true} }}
      handleComponent={handleComponent}
      handleWrapperClass={handleWrapperClass}
      onResizeStop={onResizeStop}
      size={{width: width, height: height}}
      {...rest}
    >
      {children}
    </Resizable>
  );
}

ResizableWithHandle.propTypes = {
  children: PropTypes.object,
  defaultWidth: PropTypes.string,
  defaultHeight: PropTypes.string,
  handleDirection: PropTypes.oneOf(['right', 'left', 'top', 'bottom']),
};

export default ResizableWithHandle;
