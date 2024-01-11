import React from "react";

function InputSpan({ children }) {
  return (
    <span
      id="input"
      spellCheck="false"
      className="pythonrunner-input"
      contentEditable="true"
    >
      {children}
    </span>
  );
}

export default InputSpan;
