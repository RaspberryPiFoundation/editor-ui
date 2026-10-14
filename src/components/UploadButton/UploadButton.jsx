import React, { useRef } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

import { Button } from "@raspberrypifoundation/design-system-react";
import { postMessageToScratchIframe } from "../../utils/scratchIframe";

const UploadButton = (props) => {
  const { buttonText, Icon, ...buttonProps } = props;
  const project = useSelector((state) => state.editor.project);
  const fileInputRef = useRef(null);

  const onClickUpload = () => {
    if (window.plausible) {
      window.plausible("Upload project");
    }
    fileInputRef.current?.click();
  };

  const onFileSelected = (event) => {
    const file = event.target.files?.[0];
    if (!file || project.project_type !== "code_editor_scratch") return;

    if (window.plausible) {
      window.plausible("Upload project - file selected");
    }

    postMessageToScratchIframe({ type: "scratch-gui-upload", file });

    // Reset so the same file can be selected again (change will fire next time).
    event.target.value = "";
  };

  return (
    <>
      <Button
        onClick={onClickUpload}
        text={buttonText}
        icon={Icon ? <Icon /> : null}
        {...buttonProps}
      />
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept=".sb3"
        onChange={onFileSelected}
        data-testid="upload-file-input"
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
