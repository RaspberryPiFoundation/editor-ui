import React, { useRef } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import { postMessageToScratchIframe } from "../../utils/scratchIframe";

const UploadButton = (props) => {
  const {
    buttonText,
    className,
    Icon,
    type = "secondary",
    ...otherProps
  } = props;
  const project = useSelector((state) => state.editor.project);
  const fileInputRef = useRef(null);

  const onClickUpload = () => {
    fileInputRef.current?.click();
  };

  const onFileSelected = (event) => {
    const file = event.target.files?.[0];
    if (!file || project.project_type !== "code_editor_scratch") return;
    postMessageToScratchIframe({ type: "scratch-gui-upload", file });

    // Reset so the same file can be selected again (change will fire next time).
    event.target.value = "";
  };

  return (
    <>
      <DesignSystemButton
        className={className}
        onClick={onClickUpload}
        text={buttonText}
        textAlways
        icon={Icon ? <Icon /> : null}
        type={type}
        {...otherProps}
      />
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept=".sb3"
        onChange={onFileSelected}
      />
    </>
  );
};

UploadButton.propTypes = {
  buttonText: PropTypes.string,
  className: PropTypes.string,
  Icon: PropTypes.func,
};

export default UploadButton;
