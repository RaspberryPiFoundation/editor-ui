import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { SplitViewIcon, TabbedViewIcon } from "../../../../Icons";
import Button from "../../../Button/Button";
import { setIsSplitView } from "../../EditorSlice";
import { useMediaQuery } from "react-responsive";

import { useTranslation } from "react-i18next";

import "./OutputViewToggle.scss";
import { MOBILE_MEDIA_QUERY } from "../../../../utils/mediaQueryBreakpoints";

const OutputViewToggle = () => {
  const isSplitView = useSelector((state) => state.editor.isSplitView);
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered,
  );
  const drawTriggered = useSelector((state) => state.editor.drawTriggered);
  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });

  const dispatch = useDispatch();
  const { t } = useTranslation();

  const switchToTabbedView = () => {
    dispatch(setIsSplitView(false));
  };

  const switchToSplitView = () => {
    dispatch(setIsSplitView(true));
  };

  return (
    <div className="output-view-toggle">
      {isSplitView ? (
        <Button
          className={"btn--tertiary output-view-toggle__button"}
          buttonText={isMobile ? null : t("outputViewToggle.buttonTabLabel")}
          disabled={codeRunTriggered || drawTriggered}
          label={t("outputViewToggle.buttonTabLabel")}
          title={t("outputViewToggle.buttonTabLabel")}
          ButtonIcon={TabbedViewIcon}
          buttonIconPosition="right"
          onClickHandler={switchToTabbedView}
        />
      ) : (
        <Button
          className={"btn--tertiary output-view-toggle__button"}
          buttonText={isMobile ? null : t("outputViewToggle.buttonSplitLabel")}
          disabled={codeRunTriggered || drawTriggered}
          label={t("outputViewToggle.buttonSplitLabel")}
          title={t("outputViewToggle.buttonSplitTitle")}
          ButtonIcon={SplitViewIcon}
          buttonIconPosition="right"
          onClickHandler={switchToSplitView}
        />
      )}
    </div>
  );
};

export default OutputViewToggle;
