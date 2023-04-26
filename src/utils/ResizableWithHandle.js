
import React from "react";
import { Resizable } from 're-resizable'

import './ResizableWithHandle.scss';

const Handle = () => (
  <svg width="44" height="56" viewBox="0 0 44 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" width="4" height="56" rx="2" fill="#616575" />
  </svg>
);

const handleStyles = {
  position: 'absolute',
  userSelect: 'none',
  height: '100%',
  top: '0px',
  cursor: 'col-resize',
  right: '6px',
  zIndex: '10',
};

const ResizableWithHandle = props => {
  const {children, ...rest} = props

  return (
    <Resizable
      enable={{ top: false, right: true, bottom: false, left: false }}
      handleComponent={{right: <Handle />}}
      handleWrapperClass='resizable-with-handle__handle'
      handleStyles={{right: handleStyles}}
      {...rest}
    >
      {children}
    </Resizable>
  )
}

export default ResizableWithHandle
