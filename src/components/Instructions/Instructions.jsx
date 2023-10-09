import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import { Wysiwyg } from "raspberry-pi-bits";
import { disableIframeContent } from "./cookieBot";
import "./Instructions.scss";
import { MOBILE_MEDIA_QUERY } from "../../utils/mediaQueryBreakpoints";

const Instructions = (props) => {
  const { step } = props;

  const replaceHttp = (content) => {
    if (!content) return;
    return content.replace(/(http:)/gm, "https:");
  };

  return (
    <div className="instructions">
      <Wysiwyg>
        <div
          className="instructions"
          dangerouslySetInnerHTML={{
            __html: disableIframeContent(replaceHttp(step)),
          }}
        />
      </Wysiwyg>
    </div>
  );
};

export default Instructions;
